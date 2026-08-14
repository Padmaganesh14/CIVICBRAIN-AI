import { IComplaint } from "../models/Complaint";
import { RECURRING_COMPLAINT_THRESHOLD, PATTERN_ANALYSIS_WINDOW_DAYS, SPATIAL_RADIUS_KM } from "../config/patternConfig";

export interface ComplaintCluster {
  clusterId: string;
  clusterName: string;
  category: string;
  location: string;
  complaintCount: number;
  threshold: number;
  timeWindowDays: number;
  complaintIds: string[];
  complaints: Array<{
    complaintId: string;
    title: string;
    category: string;
    address: string;
    severity: number;
    priority: string;
    createdAt: Date;
  }>;
  timeSpanDays: number;
  maxSeverity: number;
  avgSeverity: number;
  riskLevel: "High" | "Medium" | "Low";
  isRecurring: boolean;
}

/**
 * Compute Haversine distance in kilometers between two lat/lng points.
 */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Extract lat/lng numbers from complaint.
 */
function getCoords(c: any): { lat: number; lon: number } | null {
  if (typeof c.latitude === "number" && typeof c.longitude === "number") {
    return { lat: c.latitude, lon: c.longitude };
  }
  if (c.gpsLocation && typeof c.gpsLocation === "object") {
    if (typeof c.gpsLocation.latitude === "number" && typeof c.gpsLocation.longitude === "number") {
      return { lat: c.gpsLocation.latitude, lon: c.gpsLocation.longitude };
    }
  }
  return null;
}

/**
 * Perform DBSCAN / Spatial-Temporal Feature Clustering on MongoDB Complaint records.
 */
export function runSpatialTemporalClustering(complaints: IComplaint[]): ComplaintCluster[] {
  if (complaints.length === 0) return [];

  const clusters: ComplaintCluster[] = [];
  const visited = new Set<string>();

  const maxDistanceKm = SPATIAL_RADIUS_KM;
  const maxTimeDiffDays = PATTERN_ANALYSIS_WINDOW_DAYS;

  for (let i = 0; i < complaints.length; i++) {
    const primary = complaints[i];
    const pId = primary.complaintId || (primary as any)._id?.toString();
    if (visited.has(pId)) continue;

    const currentGroup: IComplaint[] = [primary];
    visited.add(pId);

    const primaryCoords = getCoords(primary);
    const primaryCat = (primary.aiCategory || primary.category || "General").toLowerCase();
    const primaryTime = new Date(primary.createdAt).getTime();

    for (let j = i + 1; j < complaints.length; j++) {
      const neighbor = complaints[j];
      const nId = neighbor.complaintId || (neighbor as any)._id?.toString();
      if (visited.has(nId)) continue;

      const neighborCoords = getCoords(neighbor);
      const neighborCat = (neighbor.aiCategory || neighbor.category || "General").toLowerCase();
      const neighborTime = new Date(neighbor.createdAt).getTime();

      // Category / Domain similarity check (prevents grouping unrelated issues like water & electricity)
      const categoryMatch =
        primaryCat === neighborCat ||
        primaryCat.includes(neighborCat) ||
        neighborCat.includes(primaryCat);

      if (!categoryMatch) continue;

      // Check spatial distance
      let spatialMatch = false;
      if (primaryCoords && neighborCoords) {
        const dist = haversineDistanceKm(primaryCoords.lat, primaryCoords.lon, neighborCoords.lat, neighborCoords.lon);
        spatialMatch = dist <= maxDistanceKm;
      } else {
        const addrA = (primary.address || "").toLowerCase();
        const addrB = (neighbor.address || "").toLowerCase();
        spatialMatch = addrA === addrB || addrA.includes(addrB) || addrB.includes(addrA);
      }

      // Check time window
      const daysDiff = Math.abs(primaryTime - neighborTime) / (1000 * 60 * 60 * 24);
      const timeMatch = daysDiff <= maxTimeDiffDays;

      if (categoryMatch && (spatialMatch || timeMatch)) {
        currentGroup.push(neighbor);
        visited.add(nId);
      }
    }

    const categoryName = primary.aiCategory || primary.category || "Civic Infrastructure Maintenance";
    const locName = primary.landmark || primary.address || "Coimbatore Sector";

    const severities = currentGroup.map((c) => c.aiSeverity ?? 50);
    const maxSev = Math.max(...severities);
    const avgSev = Math.round(severities.reduce((a, b) => a + b, 0) / severities.length);

    const times = currentGroup.map((c) => new Date(c.createdAt).getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeSpan = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24)));

    const isRecurring = currentGroup.length >= RECURRING_COMPLAINT_THRESHOLD;
    const riskLevel: "High" | "Medium" | "Low" = maxSev >= 75 || isRecurring ? "High" : maxSev >= 50 ? "Medium" : "Low";

    clusters.push({
      clusterId: `cluster_${i + 1}`,
      clusterName: `${categoryName} Pattern — ${locName}`,
      category: categoryName,
      location: locName,
      complaintCount: currentGroup.length,
      threshold: RECURRING_COMPLAINT_THRESHOLD,
      timeWindowDays: PATTERN_ANALYSIS_WINDOW_DAYS,
      complaintIds: currentGroup.map((c) => c.complaintId),
      complaints: currentGroup.map((c) => ({
        complaintId: c.complaintId,
        title: c.title,
        category: c.aiCategory || c.category || "General",
        address: c.address,
        severity: c.aiSeverity ?? 50,
        priority: c.aiPriority || "MEDIUM",
        createdAt: c.createdAt,
      })),
      timeSpanDays: timeSpan,
      maxSeverity: maxSev,
      avgSeverity: avgSev,
      riskLevel,
      isRecurring,
    });
  }

  return clusters;
}
