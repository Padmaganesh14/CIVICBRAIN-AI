import { createFileRoute } from "@tanstack/react-router";
import { Search, CalendarClock, UserCheck, Building2, Radio, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback, type FormEvent } from "react";

import { ComplaintTimeline } from "@/components/complaint-timeline";
import { GlassButton, GlassCard, PriorityBadge, Reveal } from "@/components/glass";
import { FloatingNav } from "@/components/site/floating-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { departments } from "@/data/departments";
import { findComplaint, type Complaint, type StageKey, type Priority } from "@/data/complaints";
import { apiFetch } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

const title = "Track Complaint | GrievancePilot AI";
const description =
  "Track a Tamil Nadu grievance in real time using your Complaint ID, Tracking Number or registered mobile number.";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: TrackPage,
});

type Mode = "id" | "tracking" | "mobile";

function mapBackendStatusToStage(status: string): StageKey {
  switch (status) {
    case "SUBMITTED":
      return "step.submitted";
    case "AI_PROCESSING":
    case "AI_PROCESSED":
    case "AI_PROCESSING_FAILED":
      return "step.ai";
    case "ASSIGNED":
      return "step.assigned";
    case "UNDER_REVIEW":
    case "SCHEME_REJECTED":
    case "NOT_ELIGIBLE":
    case "FUND_APPROVED":
      return "step.review";
    case "IN_PROGRESS":
      return "step.progress";
    case "RESOLVED":
    case "CLOSED":
      return "step.resolved";
    default:
      return "step.submitted";
  }
}

function TrackPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("id");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Complaint | null>(null);
  const [rawBackendData, setRawBackendData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTracking = useCallback(
    async (searchQuery: string, searchMode: Mode, isSilent = false) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        if (!isSilent) setErrorMsg("Please enter a Complaint ID, Tracking Number, or Mobile Number to search.");
        return;
      }

      if (!isSilent) {
        setLoading(true);
        setErrorMsg(null);
      }

      try {
        const cleanQuery = searchMode === "mobile" ? trimmed.replace(/^\+91/, "").replace(/\D/g, "") : trimmed;
        const res = await apiFetch(`/api/track/${encodeURIComponent(cleanQuery)}?mode=${searchMode}`);
        const json = await res.json();

        if (res.ok && json.success && json.data) {
          const d = json.data;
          setRawBackendData(d);

          const formattedComplaint: Complaint = {
            id: d.complaintId || d.id || cleanQuery,
            tracking: d.trackingNumber || d.complaintId || cleanQuery,
            mobile: d.contactNumber || "",
            citizen: d.citizenName || "Citizen User",
            citizenEmail: "",
            district: "Coimbatore",
            address: d.address || "Tamil Nadu",
            departmentId: (d.department || "Municipal Corporation").toLowerCase().split(" ")[0],
            category: d.category || "General",
            title: d.title || "Grievance Complaint",
            description: d.description || "",
            filedOn: d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
            eta: d.status === "RESOLVED" || d.status === "CLOSED" ? "Resolved" : "Within 48 hours",
            stage: mapBackendStatusToStage(d.status),
            priority: (d.priority as Priority) || "medium",
            severity: d.severity ?? 50,
            confidence: 90,
            sentiment: "NEUTRAL",
            risk: "LOW",
            officer: d.officer || "Assigned Municipal Officer",
            duplicates: 0,
            aiSummary: "",
            suggestedResponse: "",
            evidence: (d.resolutionProof || []).map((p: any) => ({
              name: p.originalName || p.filename || "Evidence",
              type: "image" as const,
              size: "1.2 MB",
            })),
            timeline: (d.timeline || []).map((ev: any) => ({
              stage: mapBackendStatusToStage(d.status),
              at: new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              note: ev.activity,
            })),
          };

          setResult(formattedComplaint);
          setErrorMsg(null);
        } else {
          // Fallback check to local sample complaints if backend fails or doesn't find record
          const localMatch = findComplaint(trimmed);
          if (localMatch) {
            setResult(localMatch);
            setRawBackendData(null);
            setErrorMsg(null);
          } else {
            setResult(null);
            setRawBackendData(null);
            setErrorMsg(json.message || t("track.notfound"));
          }
        }
      } catch (err) {
        console.error("Tracking API error:", err);
        const localMatch = findComplaint(trimmed);
        if (localMatch) {
          setResult(localMatch);
          setRawBackendData(null);
          setErrorMsg(null);
        } else {
          setResult(null);
          setRawBackendData(null);
          setErrorMsg("Unable to connect to the tracking server. Please check your connection and try again.");
        }
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [t]
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchTracking(query, mode);
  };

  // 8-second auto-polling for real-time status updates from MongoDB
  useEffect(() => {
    if (!result || !query) return;

    const intervalId = setInterval(() => {
      fetchTracking(query, mode, true);
    }, 8000);

    return () => clearInterval(intervalId);
  }, [result, query, mode, fetchTracking]);

  const dept = result ? departments.find((d) => d.id === result.departmentId || d.nameKey.toLowerCase().includes(result.departmentId)) : undefined;

  return (
    <div className="aurora-bg min-h-dvh">
      <FloatingNav />
      <main className="mx-auto max-w-4xl px-3 pt-24 pb-16 sm:px-6 sm:pt-36">
        <Reveal>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-balance sm:text-4xl lg:text-5xl">
              <span className="text-gradient-brand">{t("track.title")}</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-pretty text-muted-foreground">
              {t("track.subtitle")}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard className="mt-6 p-4 sm:p-6 md:p-8">
            <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setErrorMsg(null); }}>
              <TabsList className="grid w-full grid-cols-3 rounded-full bg-muted/70 p-1">
                <TabsTrigger value="id" className="rounded-full px-1 py-1.5 text-[11px] sm:text-xs md:text-sm truncate">
                  {t("track.by.id")}
                </TabsTrigger>
                <TabsTrigger value="tracking" className="rounded-full px-1 py-1.5 text-[11px] sm:text-xs md:text-sm truncate">
                  {t("track.by.tracking")}
                </TabsTrigger>
                <TabsTrigger value="mobile" className="rounded-full px-1 py-1.5 text-[11px] sm:text-xs md:text-sm truncate">
                  {t("track.by.mobile")}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={onSubmit} className="mt-5 sm:mt-6">
              <Label htmlFor="track-input" className="text-xs sm:text-sm font-medium">
                {t(`track.by.${mode}`)}
              </Label>
              <div className="mt-2 grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  id="track-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t(`track.placeholder.${mode}`)}
                  inputMode={mode === "mobile" ? "tel" : "text"}
                  className="h-11 sm:h-12 rounded-2xl bg-background/70 text-xs sm:text-sm"
                />
                <GlassButton type="submit" size="lg" className="rounded-2xl h-11 sm:h-12 text-xs sm:text-sm" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      🔄 Tracking...
                    </>
                  ) : (
                    <>
                      <Search className="size-4" aria-hidden="true" />
                      {t("track.button")}
                    </>
                  )}
                </GlassButton>
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground">{t("track.hint")}</p>
            </form>
          </GlassCard>
        </Reveal>

        {errorMsg ? (
          <GlassCard className="mt-6 p-6 border-red-500/30 bg-red-500/5" role="status">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-red-500 shrink-0" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{errorMsg}</p>
            </div>
          </GlassCard>
        ) : null}

        {result ? (
          <Reveal>
            <GlassCard className="mt-6 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-mono text-xs text-muted-foreground break-all">{result.id}</p>
                    {rawBackendData?.status === "AI_PROCESSING_FAILED" && (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                        ⚠️ Manual Review Required
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-base font-bold text-balance sm:text-xl">{result.title}</h2>
                </div>
                <div className="shrink-0 self-start sm:self-auto">
                  <PriorityBadge
                    level={result.priority}
                    label={t(`common.priority.${result.priority}`)}
                  />
                </div>
              </div>

              <dl className="mt-5 sm:mt-6 grid gap-2.5 sm:grid-cols-2">
                <InfoRow
                  icon={<Building2 className="size-4" />}
                  label={t("track.dept")}
                  value={rawBackendData?.department || (dept ? t(dept.nameKey) : "Municipal Office")}
                />
                <InfoRow
                  icon={<UserCheck className="size-4" />}
                  label={t("track.officer")}
                  value={result.officer}
                />
                <InfoRow
                  icon={<CalendarClock className="size-4" />}
                  label={t("track.eta")}
                  value={result.eta}
                />
                <InfoRow
                  icon={<Radio className="size-4" />}
                  label={t("track.filed")}
                  value={result.filedOn}
                />
              </dl>

              <div className="mt-6 sm:mt-8 rounded-3xl bg-muted/50 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
                  <h3 className="text-xs sm:text-sm font-semibold">{t("track.status")}</h3>
                  {rawBackendData && (
                    <span className="text-[10px] sm:text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2 sm:px-2.5 py-1 rounded-full">
                      <span className="relative flex size-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                      </span>
                      Live Database Sync
                    </span>
                  )}
                </div>
                <ComplaintTimeline stage={result.stage} events={result.timeline} />
              </div>
            </GlassCard>
          </Reveal>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 rounded-2xl bg-background/50 px-4 py-3">
      <span className="mt-0.5 shrink-0 text-primary" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}

