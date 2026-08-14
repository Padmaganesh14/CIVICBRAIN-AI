import { useState, useEffect, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { apiFetch } from '../../../lib/session'
import type { Page, OfficerWorkspaceData } from '../types'

// Fix Vite Leaflet marker default image resolution
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

interface MappedComplaint {
  raw: any;
  id: string;
  complaintId: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  severity: number | null;
  address: string;
  ward: string;
  department: string;
  lat: number;
  lng: number;
}

const COIMBATORE_CENTER: [number, number] = [11.0168, 76.9558]
const COIMBATORE_ZOOM = 12

function createPriorityIcon(priority?: string, severity?: number | null) {
  let color = '#4F46E5' // Default Indigo
  const p = (priority || '').toUpperCase()
  if (p === 'HIGH' || p === 'CRITICAL' || (severity && severity >= 70)) {
    color = '#DC2626' // Red
  } else if (p === 'MEDIUM' || (severity && severity >= 40)) {
    color = '#D97706' // Amber
  } else if (p === 'LOW' || p === 'RESOLVED') {
    color = '#059669' // Green
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4.5" fill="#FFFFFF"/>
  </svg>`

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -32],
  })
}

function MapController({ coords }: { coords: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length === 1 && coords[0]) {
      map.setView(coords[0], 14, { animate: true })
    } else if (coords.length > 1) {
      const bounds = L.latLngBounds(coords)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [coords, map])
  return null
}

function extractCoordinates(c: any): { lat: number; lng: number } | null {
  let lat = c.latitude ?? c.lat ?? c.gpsLocation?.latitude ?? c.gpsLocation?.lat
  let lng = c.longitude ?? c.lng ?? c.gpsLocation?.longitude ?? c.gpsLocation?.lng

  if (typeof c.gpsLocation === 'string' && (!lat || !lng)) {
    const parts = c.gpsLocation.split(',').map((p: string) => parseFloat(p.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      lat = parts[0]
      lng = parts[1]
    }
  }

  if (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ) {
    return { lat, lng }
  }
  return null
}

export default function MunicipalMap({ data, navigate }: Props) {
  const officerDept = data?.officer?.department || "Road Department";
  const [complaints, setComplaints] = useState<any[]>(data?.complaints ?? [])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/officer/complaints')
      if (!res.ok) {
        throw new Error(`Failed to load complaints (${res.status})`)
      }
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setComplaints(json.data)
      } else {
        setComplaints([])
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load complaint locations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!data?.complaints || data.complaints.length === 0) {
      fetchComplaints()
    }
  }, [data?.complaints, fetchComplaints])

  const mappedComplaints: MappedComplaint[] = []
  let unmappedCount = 0

  complaints.forEach((c) => {
    const coords = extractCoordinates(c)
    if (coords) {
      mappedComplaints.push({
        raw: c,
        id: c._id || c.complaintId || Math.random().toString(),
        complaintId: c.complaintId || 'N/A',
        title: c.title || 'Untitled Complaint',
        category: c.category || c.aiCategory || 'Not available',
        status: c.status || 'Not available',
        priority: c.aiPriority || 'Not available',
        severity: typeof c.aiSeverity === 'number' ? c.aiSeverity : null,
        address: c.address || c.landmark || 'Not available',
        ward: c.ward || c.district || 'Not available',
        department: c.department || c.aiDepartment || officerDept,
        lat: coords.lat,
        lng: coords.lng,
      })
    } else {
      unmappedCount++
    }
  })

  const validCoords: [number, number][] = mappedComplaints.map((m) => [m.lat, m.lng])

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-screen-xl min-w-0">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Municipal Spatial Map</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Geographic mapping of active <strong>{officerDept}</strong> complaints across <strong>Coimbatore Corporation</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchComplaints}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border bg-white hover:bg-slate-50 transition-colors cursor-pointer text-slate-700"
            style={{ borderColor: '#E2E8F0' }}
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            {loading ? 'Refreshing…' : 'Refresh Map'}
          </button>

          <button
            onClick={() => navigate('grievance')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            View Grievance Queue →
          </button>
        </div>
      </div>

      {/* Main Map Box */}
      <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: '#E2E8F0' }}>
        {/* Status Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: '#F1F5F9' }}>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              GPS Mapping Active ({mappedComplaints.length} Complaints Mapped)
            </span>

            {unmappedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                Location Unavailable ({unmappedCount})
              </span>
            )}
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Default Context: Coimbatore Corporation ([11.0168, 76.9558])
          </span>
        </div>

        {/* Leaflet Map Canvas Area */}
        <div className="w-full rounded-xl overflow-hidden relative border shadow-inner h-[520px] md:h-[450px] sm:h-[400px]" style={{ borderColor: '#E2E8F0' }}>
          {loading && (
            <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-semibold gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Loading complaint locations...
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 z-40 bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="text-rose-600 font-bold text-sm">⚠️ {error}</div>
              <button
                onClick={fetchComplaints}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          ) : (
            <>
              {/* Map Empty Overlay if 0 Mapped Complaints */}
              {mappedComplaints.length === 0 && !loading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 px-4 py-2 rounded-xl shadow-lg border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <span>📍</span> No complaints with GPS coordinates available in {officerDept}.
                </div>
              )}

              <MapContainer
                center={COIMBATORE_CENTER}
                zoom={COIMBATORE_ZOOM}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController coords={validCoords} />

                <MarkerClusterGroup chunkedLoading>
                  {mappedComplaints.map((item) => (
                    <Marker
                      key={item.id}
                      position={[item.lat, item.lng]}
                      icon={createPriorityIcon(item.priority, item.severity)}
                    >
                      <Popup className="custom-leaflet-popup">
                        <div className="p-1 space-y-1.5 text-xs max-w-xs">
                          <div className="flex items-center justify-between border-b pb-1">
                            <span className="font-mono font-bold text-indigo-600">#{item.complaintId}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                              {item.status}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>

                          <div className="space-y-1 text-slate-600 text-[11px]">
                            <div><strong>Category:</strong> {item.category}</div>
                            <div>
                              <strong>Priority / Severity:</strong>{' '}
                              <span className="font-semibold text-slate-800">
                                {item.priority} {item.severity !== null ? `(${item.severity}/100)` : ''}
                              </span>
                            </div>
                            <div><strong>Address:</strong> {item.address}</div>
                            <div><strong>Ward / Area:</strong> {item.ward}</div>
                            <div><strong>Department:</strong> {item.department}</div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>

              {/* Floating Map Legend */}
              <div className="absolute bottom-4 right-4 z-40 bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-lg border border-slate-200 text-[11px] space-y-1.5">
                <div className="font-bold text-slate-800 border-b pb-1 mb-1">Map Legend</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-rose-600" /> High / Critical Priority
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-amber-500" /> Medium Priority
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" /> Low / Resolved
                </div>
                {unmappedCount > 0 && (
                  <div className="flex items-center gap-2 text-slate-400 border-t pt-1 mt-1 font-mono">
                    <span>⚪</span> Unmapped Location ({unmappedCount})
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
