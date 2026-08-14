import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FilePlus2,
  Search,
  Bell,
  ArrowRight,
  Clock3,
  CircleCheckBig,
  Activity,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app/app-shell";
import { GlassCard, PriorityBadge, Reveal, glassButtonClass } from "@/components/glass";
import { useSession, apiFetch } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

const title = "Citizen Dashboard | GrievancePilot AI";
const description =
  "Your grievances, notifications, AI suggestions and recent activity in one glass dashboard.";

export const Route = createFileRoute("/citizen/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CitizenDashboard,
});

// ─── Types from backend ───────────────────────────────────────────────────────

interface BackendComplaint {
  _id: string;
  complaintId: string;
  title: string;
  description: string;
  department: string;
  district: string;
  address: string;
  status: string;
  priority?: string;
  aiSeverity?: number;
  aiConfidence?: number;
  aiSummary?: string;
  officerRemarks?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

// ─── Status label helper ──────────────────────────────────────────────────────

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    SUBMITTED: "Submitted",
    AI_PROCESSING: "AI Processing",
    AI_PROCESSED: "AI Processed",
    AI_PROCESSING_FAILED: "AI Processing Failed",
    ASSIGNED: "Assigned",
    UNDER_REVIEW: "Under Review",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  };
  return map[status] ?? status;
}

function statusColor(status: string): string {
  if (status === "RESOLVED" || status === "CLOSED") return "bg-secondary/15 text-secondary-foreground";
  if (status === "IN_PROGRESS" || status === "UNDER_REVIEW") return "bg-primary/10 text-primary";
  if (status.includes("AI")) return "bg-accent/15 text-accent-foreground";
  return "bg-muted text-muted-foreground";
}

// ─── Component ────────────────────────────────────────────────────────────────

function CitizenDashboard() {
  const { t } = useI18n();
  const { user } = useSession();
  const [complaints, setComplaints] = useState<BackendComplaint[]>([]);
  const [notifications, setNotifications] = useState<{ _id: string; message: string; createdAt: string; read?: boolean }[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const [errorComplaints, setErrorComplaints] = useState("");

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    setErrorComplaints("");
    try {
      const res = await apiFetch("/api/complaints/my");
      if (res.status === 401) {
        setErrorComplaints("Your session has expired. Please log in again.");
        return;
      }
      const json = await res.json();
      if (res.ok && json.success) {
        setComplaints(json.data || []);
      } else {
        setErrorComplaints(json.message || "Failed to load complaints.");
      }
    } catch {
      setErrorComplaints("Unable to connect to the server. Please try again.");
    } finally {
      setLoadingComplaints(false);
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await apiFetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch {
      // silently ignore notification errors
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    void fetchComplaints();
    void fetchNotifications();
  }, []);

  // ── Stats ──
  const total = complaints.length;
  const open = complaints.filter((c) => !["RESOLVED", "CLOSED"].includes(c.status)).length;
  const resolved = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const submitted = complaints.filter((c) => c.status === "SUBMITTED").length;
  const aiProcessing = complaints.filter((c) => c.status.startsWith("AI")).length;

  const recentComplaints = complaints.slice(0, 5);

  return (
    <AppShell role="citizen">
      {/* Welcome Card */}
      <Reveal>
        <GlassCard className="p-7 sm:p-9">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{t("dash.welcome")}</p>
              <h1 className="mt-1 text-2xl font-extrabold text-balance sm:text-4xl">
                <span className="text-gradient-brand">{user?.name ?? "Citizen"}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">@{user?.username}</p>
              {user?.phone && (
                <p className="text-xs text-muted-foreground">📞 {user.phone}</p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">{t("dash.welcome.sub")}</p>
            </div>
            <dl className="grid grid-cols-3 gap-3">
              <Stat icon={<Clock3 className="size-4" />} label="Open" value={String(open)} />
              <Stat icon={<CircleCheckBig className="size-4" />} label="Resolved" value={String(resolved)} />
              <Stat icon={<Activity className="size-4" />} label="Total" value={String(total)} />
            </dl>
          </div>
        </GlassCard>
      </Reveal>

      {/* Quick Actions */}
      <section className="mt-6" aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="sr-only">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Reveal>
            <Link to="/citizen/file" className="block h-full">
              <GlassCard className="glow-ring h-full p-7">
                <span className="grid size-14 place-items-center rounded-3xl bg-gradient-to-br from-primary/25 to-accent/20 text-primary">
                  <FilePlus2 className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{t("dash.file")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("file.subtitle")}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {t("file.next")} <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </GlassCard>
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <Link to="/track" className="block h-full">
              <GlassCard className="glow-ring h-full p-7">
                <span className="grid size-14 place-items-center rounded-3xl bg-gradient-to-br from-secondary/25 to-primary/20 text-primary">
                  <Search className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{t("dash.track")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("track.subtitle")}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {t("track.button")} <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </GlassCard>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Stats breakdown */}
      {!loadingComplaints && !errorComplaints && total > 0 && (
        <Reveal>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Submitted" value={submitted} color="bg-muted/50" />
            <StatCard label="AI Processing" value={aiProcessing} color="bg-accent/8" />
            <StatCard label="In Progress" value={inProgress} color="bg-primary/8" />
            <StatCard label="Resolved/Closed" value={resolved} color="bg-secondary/12" />
          </div>
        </Reveal>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Recent Complaints */}
        <Reveal className="lg:col-span-2">
          <GlassCard className="h-full p-6 sm:p-7">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-base font-bold">{t("dash.previous")}</h2>
              <Link to="/track" className="text-xs font-semibold text-primary hover:underline">
                {t("dash.viewall")}
              </Link>
            </div>

            {loadingComplaints ? (
              <div className="mt-8 flex flex-col items-center gap-3 py-4 text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-sm">Loading your complaints…</p>
              </div>
            ) : errorComplaints ? (
              <div className="mt-5 rounded-2xl bg-destructive/10 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">{errorComplaints}</p>
                    <button
                      type="button"
                      onClick={() => void fetchComplaints()}
                      className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <RefreshCw className="size-3" /> Retry
                    </button>
                  </div>
                </div>
              </div>
            ) : recentComplaints.length === 0 ? (
              <div className="mt-8 py-8 text-center">
                <FilePlus2 className="mx-auto size-12 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No complaints filed yet.</p>
                <Link
                  to="/citizen/file"
                  className={glassButtonClass({ variant: "primary", size: "sm" }, "mt-4 inline-flex")}
                >
                  File Your First Grievance
                </Link>
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {recentComplaints.map((c) => (
                  <li key={c._id}>
                    <div className="rounded-2xl bg-background/55 p-4">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-[11px] text-muted-foreground">{c.complaintId}</p>
                          <p className="mt-0.5 truncate text-sm font-semibold">{c.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {c.department} · {c.district}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor(c.status)}`}>
                          {statusLabel(c.status)}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Filed: {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </Reveal>

        {/* Notifications */}
        <div className="space-y-4">
          <Reveal delay={0.12}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Bell className="size-4.5 text-primary" aria-hidden="true" />
                {t("dash.notifications")}
              </h2>
              {loadingNotifs ? (
                <div className="mt-5 flex justify-center">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="mt-4 text-xs text-muted-foreground">No notifications yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {notifications.slice(0, 4).map((n) => (
                    <li key={n._id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                      <p className="text-xs font-semibold text-pretty">{n.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </Reveal>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/citizen/file" className={glassButtonClass({ variant: "primary", size: "lg" })}>
          <FilePlus2 className="size-4.5" aria-hidden="true" />
          {t("dash.file")}
        </Link>
      </div>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/55 px-4 py-3 text-center">
      <span className="mx-auto grid size-8 place-items-center rounded-full bg-primary/12 text-primary">
        {icon}
      </span>
      <dd className="mt-2 font-display text-lg font-extrabold tabular-nums">{value}</dd>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <p className="font-display text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
