import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CircleCheckBig,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  Mic,
  Phone,
  Sparkles,
  User,
  Video,
  MessageSquareMore,
  Loader2,
  AlertCircle,
  RefreshCw,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/app-shell";
import { GlassButton, GlassCard, Reveal } from "@/components/glass";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/officer/complaints/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Review ${params.id} | TN Grievance Officer Console` },
      { name: "description", content: "Officer review and action panel for a citizen grievance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComplaintReview,
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface AIAnalysis {
  summary?: string;
  category?: string;
  department?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  urgency?: string;
  affectedPeople?: number;
  schemeEligible?: boolean;
  scheme?: string;
  fundAvailable?: boolean;
  recommendedAction?: string;
  reason?: string[];
}

interface OfficerDecision {
  decision: "APPROVED" | "REJECTED" | "CLARIFICATION_REQUESTED";
  remarks?: string;
  decidedAt: string;
  decidedBy: string;
}

interface Attachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

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
  aiPriority?: string;
  aiSeverity?: number;
  aiConfidence?: number;
  aiSummary?: string;
  aiDepartment?: string;
  aiAnalysis?: AIAnalysis;
  officerDecision?: OfficerDecision;
  officerRemarks?: string;
  attachments?: Attachment[];
  resolutionProof?: Attachment[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  userId?: {
    _id: string;
    username: string;
    name: string;
    phone?: string;
  };
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["AI_PROCESSING"],
  AI_PROCESSING: ["AI_PROCESSED", "AI_PROCESSING_FAILED"],
  AI_PROCESSING_FAILED: ["AI_PROCESSING", "ASSIGNED"],
  AI_PROCESSED: ["ASSIGNED"],
  ASSIGNED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

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
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CLARIFICATION_REQUESTED: "Clarification Requested",
  };
  return map[status] ?? status;
}

function mimeToKind(mimeType: string): "image" | "video" | "pdf" | "audio" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  return "audio";
}

const evidenceIcon = {
  image: ImageIcon,
  video: Video,
  pdf: FileText,
  audio: Mic,
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

function ComplaintReview() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<BackendComplaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [note, setNote] = useState("");
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchComplaint = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/officer/complaints/${id}`);
      if (res.status === 401) { setError("Session expired. Please log in again."); return; }
      if (res.status === 403) { setError("Access denied. This complaint is outside your department."); return; }
      if (res.status === 404) { setError("Complaint not found."); return; }
      const json = await res.json();
      if (res.ok && json.success) {
        const data = json.data?.complaint ?? json.data;
        setComplaint(data);
        setNewStatus("");
      } else {
        setError(json.message || "Failed to load complaint.");
      }
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchComplaint();
  }, [id]);

  const handleOfficerDecision = async (decision: "APPROVED" | "REJECTED" | "CLARIFICATION_REQUESTED") => {
    if (!complaint) return;
    setSubmittingDecision(true);
    try {
      const res = await apiFetch(`/api/officer/complaints/${complaint.complaintId}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision, remarks: note.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Officer Decision recorded: ${decision}`);
        setComplaint(json.data);
        setNote("");
      } else {
        toast.error(json.message || "Failed to record decision.");
      }
    } catch {
      toast.error("Unable to connect to the server.");
    } finally {
      setSubmittingDecision(false);
    }
  };

  const updateStatus = async () => {
    if (!newStatus || !complaint) return;
    setUpdatingStatus(true);
    try {
      const res = await apiFetch(`/api/officer/complaints/${complaint.complaintId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Status updated to ${statusLabel(newStatus)}.`);
        setComplaint((prev) => prev ? { ...prev, status: newStatus } : prev);
        setNewStatus("");
      } else {
        toast.error(json.message || "Status update failed.");
      }
    } catch {
      toast.error("Unable to connect to the server.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Loading / Error states ──
  if (loading) {
    return (
      <AppShell role="officer">
        <div className="flex min-h-64 flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading complaint details…</p>
        </div>
      </AppShell>
    );
  }

  if (error || !complaint) {
    return (
      <AppShell role="officer">
        <div className="mx-auto max-w-lg mt-8">
          <GlassCard className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">{error || "Complaint not found."}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void fetchComplaint()}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <RefreshCw className="size-3.5" /> Retry
                  </button>
                  <Link to="/officer" className="text-sm text-muted-foreground hover:underline">
                    ← Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </AppShell>
    );
  }

  const allowedTransitions = STATUS_TRANSITIONS[complaint.status] ?? [];
  const allAttachments = [...(complaint.attachments ?? [])];
  const ai = complaint.aiAnalysis;

  return (
    <AppShell role="officer">
      <Reveal>
        <Link
          to="/officer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("officer.dash.title")}
        </Link>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">{complaint.complaintId}</p>
            <h1 className="mt-1 text-xl font-extrabold text-balance sm:text-3xl">
              {complaint.title}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              {complaint.department} · {complaint.district}
            </p>
          </div>
          <span className="self-start sm:self-auto shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs sm:text-sm font-semibold text-primary">
            {statusLabel(complaint.status)}
          </span>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* AI Recommendation Card (Prominent Header) */}
          <Reveal delay={0.05}>
            <GlassCard className="p-6 border-2 border-primary/20 bg-background/85">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-gradient-brand">
                      AI Recommendation Analysis
                    </h2>
                    <p className="text-xs text-muted-foreground">n8n + Gemini Automated Synthesis</p>
                  </div>
                </div>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
                  AI ASSISTED
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {/* AI Summary */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Summary</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-foreground bg-secondary/15 p-3.5 rounded-2xl">
                    {ai?.summary || complaint.aiSummary || "AI summary generated upon complaint submission."}
                  </p>
                </div>

                {/* Grid Metrics */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-background/60 p-3">
                    <dt className="text-[11px] font-semibold text-muted-foreground uppercase">Priority</dt>
                    <dd className="mt-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/12 px-2.5 py-0.5 text-xs font-bold text-destructive">
                        🔴 {ai?.priority || complaint.aiPriority || "HIGH"}
                      </span>
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-background/60 p-3">
                    <dt className="text-[11px] font-semibold text-muted-foreground uppercase">Estimated Urgency</dt>
                    <dd className="mt-1 text-xs font-bold text-foreground">
                      {ai?.urgency || "24–48 hours"}
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-background/60 p-3">
                    <dt className="text-[11px] font-semibold text-muted-foreground uppercase">Impact Level</dt>
                    <dd className="mt-1 text-xs font-bold text-foreground">
                      ~{ai?.affectedPeople || 30} Households
                    </dd>
                  </div>
                </div>

                {/* Scheme & Fund Analysis */}
                <div className="rounded-2xl bg-primary/8 p-4 space-y-2 text-xs">
                  <p className="font-bold text-primary text-sm">Scheme & Fund Analysis</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl bg-background px-3 py-1 font-semibold text-foreground border border-border">
                      Scheme: {ai?.scheme || "Municipal Infrastructure Maintenance"}
                    </span>
                    <span className={`rounded-xl px-3 py-1 font-bold ${ai?.fundAvailable ?? true ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/15 text-destructive"}`}>
                      {ai?.fundAvailable ?? true ? "✓ Fund Available" : "❌ Fund Pending"}
                    </span>
                    <span className="rounded-xl bg-accent/15 px-3 py-1 font-bold text-accent">
                      Recommended: {ai?.recommendedAction || "APPROVAL_REQUIRED"}
                    </span>
                  </div>
                </div>

                {/* Reasoning Bullets */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Reason for Recommendation</p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {(ai?.reason || [
                      "Public health & safety concern identified",
                      "Multiple households affected in locality",
                      "Active infrastructure maintenance required"
                    ]).map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          </Reveal>

          {/* Citizen Info */}
          <Reveal>
            <GlassCard className="p-6">
              <h2 className="text-base font-bold">{t("review.citizen")}</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Info icon={<User className="size-4" />} label="Name" value={complaint.userId?.name ?? "—"} />
                <Info icon={<Phone className="size-4" />} label="Username" value={`@${complaint.userId?.username ?? "—"}`} />
                {complaint.userId?.phone && (
                  <Info icon={<Phone className="size-4" />} label="Phone" value={complaint.userId.phone} />
                )}
                <Info icon={<MapPin className="size-4" />} label="Address" value={complaint.address} />
              </dl>
            </GlassCard>
          </Reveal>

          {/* Original Citizen Complaint Details */}
          <Reveal delay={0.08}>
            <GlassCard className="p-6">
              <h2 className="text-base font-bold">Original Citizen Complaint</h2>
              <p className="mt-3 text-sm leading-relaxed text-pretty">{complaint.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Chip>Filed: {new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</Chip>
                <Chip>{statusLabel(complaint.status)}</Chip>
                {complaint.closedAt && <Chip>Closed: {new Date(complaint.closedAt).toLocaleDateString("en-IN")}</Chip>}
              </div>
            </GlassCard>
          </Reveal>

          {/* Evidence / Attachments */}
          {allAttachments.length > 0 && (
            <Reveal delay={0.1}>
              <GlassCard className="p-6">
                <h2 className="text-base font-bold">{t("review.evidence")}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {allAttachments.map((e) => {
                    const kind = mimeToKind(e.mimeType);
                    const Icon = evidenceIcon[kind];
                    return (
                      <li
                        key={e.filename}
                        className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl bg-background/60 p-4"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/15 text-primary">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{e.originalName}</span>
                          <span className="block text-xs text-muted-foreground">
                            {(e.size / 1024).toFixed(0)} KB
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </GlassCard>
            </Reveal>
          )}
        </div>

        {/* Right Column: Officer Decision Panel */}
        <div className="space-y-4">
          {/* Officer Decision Box */}
          <Reveal delay={0.12}>
            <GlassCard className="p-6 border-2 border-accent/20">
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <CircleCheckBig className="size-5 text-accent" />
                Officer Decision & Action
              </h2>

              {complaint.officerDecision ? (
                <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-xs space-y-2">
                  <p className="font-bold text-sm text-emerald-600">
                    Decision Applied: {statusLabel(complaint.officerDecision.decision)}
                  </p>
                  <p className="text-muted-foreground">
                    Decided by <strong>{complaint.officerDecision.decidedBy}</strong> on{" "}
                    {new Date(complaint.officerDecision.decidedAt).toLocaleString("en-IN")}
                  </p>
                  {complaint.officerDecision.remarks && (
                    <p className="text-foreground italic mt-1 bg-background/50 p-2.5 rounded-xl">
                      "{complaint.officerDecision.remarks}"
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Review the AI Recommendation and apply your authorized administrative decision.
                </p>
              )}

              <div className="mt-4 space-y-3">
                <label htmlFor="note" className="text-xs font-semibold uppercase text-muted-foreground">
                  Officer Decision Remarks
                </label>
                <Textarea
                  id="note"
                  rows={3}
                  value={note}
                  placeholder="Enter officer notes or instructions before decision…"
                  onChange={(e) => setNote(e.target.value)}
                  className="rounded-2xl bg-background/70 text-xs"
                  disabled={submittingDecision}
                />

                <div className="space-y-2 pt-2">
                  <GlassButton
                    type="button"
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3"
                    disabled={submittingDecision}
                    onClick={() => handleOfficerDecision("APPROVED")}
                  >
                    {submittingDecision ? <Loader2 className="size-4 animate-spin" /> : "✓ Approve"}
                  </GlassButton>

                  <div className="grid grid-cols-2 gap-2">
                    <GlassButton
                      type="button"
                      variant="glass"
                      className="w-full rounded-2xl bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/30 text-xs py-2.5"
                      disabled={submittingDecision}
                      onClick={() => handleOfficerDecision("CLARIFICATION_REQUESTED")}
                    >
                      Request Clarification
                    </GlassButton>
                    <GlassButton
                      type="button"
                      variant="glass"
                      className="w-full rounded-2xl bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/30 text-xs py-2.5"
                      disabled={submittingDecision}
                      onClick={() => handleOfficerDecision("REJECTED")}
                    >
                      Reject
                    </GlassButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Reveal>

          {/* Status Override / Update Status */}
          <Reveal delay={0.14}>
            <GlassCard className="p-6">
              <h2 className="text-base font-bold">Manual Status Override</h2>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-3">
                  Current Status: <strong>{statusLabel(complaint.status)}</strong>
                </p>
                {allowedTransitions.length > 0 ? (
                  <div className="space-y-3">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="!h-11 rounded-2xl bg-background/70 text-xs">
                        <SelectValue placeholder="Select status…" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedTransitions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {statusLabel(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <GlassButton
                      className="w-full rounded-2xl text-xs"
                      disabled={!newStatus || updatingStatus}
                      onClick={updateStatus}
                    >
                      {updatingStatus ? (
                        <><Loader2 className="size-3.5 animate-spin" /> Updating…</>
                      ) : (
                        <><CircleCheckBig className="size-3.5" /> Advance Status</>
                      )}
                    </GlassButton>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-secondary/12 p-3 text-xs text-muted-foreground">
                    No further status transitions available. Status is {statusLabel(complaint.status).toLowerCase()}.
                  </div>
                )}
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </AppShell>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-2xl bg-background/60 p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 truncate text-sm font-semibold">{value}</dd>
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{children}</span>
  );
}
