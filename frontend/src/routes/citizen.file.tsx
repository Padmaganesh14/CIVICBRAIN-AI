import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  Crosshair,
  Upload,
  Mic,
  FileText,
  Image as ImageIcon,
  Video,
  CircleCheckBig,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/app/app-shell";
import { GlassButton, GlassCard, PriorityBadge, Reveal, glassButtonClass } from "@/components/glass";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { departments, districts } from "@/data/departments";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { apiFetch, readUser } from "@/lib/session";
import ChennaiMap from "@/components/ChennaiMap";
import { analyzeComplaint, type ComplaintResponse } from "@/services/n8n";

import emailjs from "@emailjs/browser";

const title = "File a Grievance | GrievancePilot AI";
const description =
  "Submit a Tamil Nadu grievance in six guided steps with location, evidence and an AI analysis preview before submission.";

export const Route = createFileRoute("/citizen/file")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FileGrievance,
});

const stepKeys = ["file.s1", "file.s2", "file.s3", "file.s4", "file.s5", "file.s6"];

type Attachment = { name: string; kind: "image" | "video" | "pdf" | "audio"; file?: File };

function FileGrievance() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [deptId, setDeptId] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [district, setDistrict] = useState<string>("Chennai");
  const [address, setAddress] = useState("");
  const [gpsCoords, setGpsCoords] = useState<[number, number]>([13.0827, 80.2707]);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState<{ id: string; tracking?: string } | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [n8nResult, setN8nResult] = useState<{ summary?: string; issue?: string; department?: string; reason?: string } | null>(null);
  const [n8nError, setN8nError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dept = departments.find((d) => d.id === deptId);

  const handleRunN8nAnalysis = async () => {
    setAiAnalyzing(true);
    setN8nError("");
    try {
      const formData = new FormData();
      formData.append("complaintId", `GRV-${Date.now()}`);
      formData.append("title", category ? `${category} - ${district}` : `Grievance - ${district}`);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("address", address);
      formData.append("latitude", String(gpsCoords[0]));
      formData.append("longitude", String(gpsCoords[1]));

      // If user uploaded a PDF or file, append the first PDF or file as "file" for n8n
      const pdfFileObj = files.find((f) => f.kind === "pdf") || files[0];
      if (pdfFileObj?.file) {
        formData.append("file", pdfFileObj.file);
      }

      const res = await analyzeComplaint(formData);
      if (res.success && res.data?.output) {
        setN8nResult(res.data.output);
      } else {
        setN8nError(res.message || "Failed to retrieve AI analysis from n8n.");
      }
    } catch (err: any) {
      setN8nError(err.message || "Error calling n8n webhook.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const ai = useMemo(() => {
    const len = description.trim().length;
    const urgentWords = /(urgent|danger|accident|leak|fire|dark|child|hospital|அவசர|ஆபத்து)/i;
    const severity = Math.min(96, 42 + Math.round(len / 6) + (urgentWords.test(description) ? 22 : 0));
    const priority: "critical" | "high" | "medium" | "low" =
      severity >= 85 ? "critical" : severity >= 70 ? "high" : severity >= 50 ? "medium" : "low";
    const confidence = Math.min(99, 78 + Math.round(len / 22) + files.length * 3);
    const etaDays = dept ? Math.max(0.5, dept.avgDays * (severity >= 85 ? 0.5 : 1)) : 3;
    return { severity, priority, confidence, etaDays };
  }, [description, files.length, dept]);

  const hasDescription = description.trim().length > 0;
  const hasDocument = files.length > 0;
  const hasValidInput = hasDescription || hasDocument;

  const canContinue = [
    Boolean(deptId),
    Boolean(category),
    Boolean(address.trim()),
    hasValidInput,
    hasValidInput,
    true,
  ][step];

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      const currentUser = readUser();
      formData.append("title", category ? `${category} - ${district}` : `Grievance - ${district}`);
      formData.append("description", description.trim());
      formData.append("department", dept ? t(dept.nameKey) : deptId);
      formData.append("district", district);
      formData.append("address", address);
      formData.append("category", category);
      formData.append("gpsLocation", JSON.stringify({ latitude: gpsCoords[0], longitude: gpsCoords[1] }));
      formData.append("contactNumber", currentUser?.phone || "0000000000");

      files.forEach((f) => {
        if (f.file) formData.append("attachments", f.file, f.name);
      });

      const res = await apiFetch("/api/complaints", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok && json.success) {
        setSubmitted({
          id: json.data.complaintId,
          tracking: json.data._id,
        });

        // Trigger EmailJS Officer Notification using Vite Environment Variables
        const serviceId = import.meta.env["VITE_EMAILJS_SERVICE_ID"];
        const templateId = import.meta.env["VITE_EMAILJS_TEMPLATE_ID"];
        const publicKey = import.meta.env["VITE_EMAILJS_PUBLIC_KEY"];

        if (serviceId && templateId && publicKey) {
          const officerEmail = json.data.assignedOfficerEmail || "ganesh@municipality.gov";
          const officerName = json.data.assignedOfficerName || "Department Officer";

          emailjs
            .send(
              serviceId,
              templateId,
              {
                to_email: officerEmail,
                officer_name: officerName,
                complaint_id: json.data.complaintId,
                complaint_title: json.data.title,
                complaint_description: json.data.description || "PDF document attached",
                location: json.data.address,
                department: json.data.department || category,
                priority: json.data.aiPriority || "HIGH",
                ai_summary: json.data.aiSummary || json.data.title,
                recommended_action: json.data.aiAnalysis?.recommendedAction || "APPROVAL_REQUIRED",
                portal_url: `${window.location.origin}/officer`,
              },
              publicKey
            )
            .catch((err) => {
              console.warn("EmailJS notification dispatch warning:", err);
            });
        }
      } else {
        setSubmitError(json.message || "Please describe your complaint or upload a supporting document.");
      }
    } catch {
      setSubmitError("Unable to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const remaining = 5 - files.length;
    const toAdd = selected.slice(0, remaining).map((file) => {
      const kind = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : file.type === "application/pdf"
        ? "pdf"
        : "audio";
      return { name: file.name, kind: kind as Attachment["kind"], file };
    });
    setFiles((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (submitted) {
    return (
      <AppShell role="citizen">
        <Reveal>
          <GlassCard className="mx-auto max-w-xl p-8 text-center sm:p-10">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-secondary/18 text-secondary-foreground animate-pulse-ring">
              <CircleCheckBig className="size-10" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-2xl font-extrabold text-balance sm:text-3xl">
              {t("file.success.title")}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{t("file.success.body")}</p>

            <dl className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-background/60 p-4">
                <dt className="text-xs text-muted-foreground">{t("file.complaintid")}</dt>
                <dd className="mt-1 font-mono text-sm font-bold">{submitted.id}</dd>
              </div>
              {submitted.tracking && (
                <div className="rounded-2xl bg-background/60 p-4">
                  <dt className="text-xs text-muted-foreground">Reference ID</dt>
                  <dd className="mt-1 font-mono text-xs font-bold break-all">{submitted.tracking}</dd>
                </div>
              )}
            </dl>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Link to="/track" className={glassButtonClass({ variant: "primary", size: "lg" })}>
                {t("file.gotrack")}
              </Link>
              <Link to="/citizen" className={glassButtonClass({ variant: "glass", size: "lg" })}>
                {t("file.dashboard")}
              </Link>
            </div>
          </GlassCard>
        </Reveal>
      </AppShell>
    );
  }

  return (
    <AppShell role="citizen">
      <Reveal>
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-extrabold text-balance sm:text-4xl">
            <span className="text-gradient-brand">{t("file.title")}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("file.subtitle")}</p>

          <ol className="mt-7 flex items-center gap-1.5" aria-label={t("file.step")}>
            {stepKeys.map((k, i) => (
              <li key={k} className="flex-1">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-colors duration-500",
                    i <= step ? "bg-gradient-to-r from-primary to-accent" : "bg-border",
                  )}
                />
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t("file.step")} {step + 1} {t("file.of")} {stepKeys.length} · {t(stepKeys[step]!)}
          </p>

          <GlassCard className="mt-5 p-6 sm:p-8">
            {/* Step 0: Department */}
            {step === 0 ? (
              <fieldset>
                <legend className="sr-only">{t("file.s1")}</legend>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {departments.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => { setDeptId(d.id); setCategory(""); }}
                        aria-pressed={deptId === d.id}
                        className={cn(
                          "grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                          deptId === d.id
                            ? "border-primary bg-primary/8 shadow-[0_0_0_1px_var(--color-primary)]"
                            : "border-border bg-background/50 hover:bg-background/80",
                        )}
                      >
                        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${d.tint} text-primary`}>
                          <d.icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{t(d.nameKey)}</span>
                          <span className="block text-xs text-muted-foreground">
                            {t("dept.avg")}: {d.avgDays} {t("stats.days")}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </fieldset>
            ) : null}

            {/* Step 1: Category */}
            {step === 1 ? (
              <fieldset>
                <legend className="sr-only">{t("file.s2")}</legend>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {(dept?.categories ?? []).map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => setCategory(c)}
                        aria-pressed={category === c}
                        className={cn(
                          "min-h-14 w-full rounded-2xl border px-4 text-left text-sm font-medium transition-all",
                          category === c
                            ? "border-primary bg-primary/8 shadow-[0_0_0_1px_var(--color-primary)]"
                            : "border-border bg-background/50 hover:bg-background/80",
                        )}
                      >
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </fieldset>
            ) : null}

            {/* Step 2: Location */}
            {step === 2 ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="district">{t("file.district")}</Label>
                  <Select value={district} onValueChange={setDistrict}>
                    <SelectTrigger id="district" className="mt-1.5 !h-12 rounded-2xl bg-background/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="address">{t("file.address")}</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1.5 h-12 rounded-2xl bg-background/70"
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">{t("file.location.pick")}</p>
                  <ChennaiMap onLocationSelect={(lat, lng) => setGpsCoords([lat, lng])} />
                </div>
              </div>
            ) : null}

            {/* Step 3: Description */}
            {step === 3 ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="desc" className="text-base font-bold text-foreground">
                    {t("file.desc.label")}
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tell us what happened. You can type your complaint, upload a supporting document, or provide both.
                  </p>
                  <Textarea
                    id="desc"
                    rows={6}
                    value={description}
                    placeholder="Type your complaint description here (Optional if a supporting document is uploaded)…"
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 rounded-2xl bg-background/70 text-sm"
                  />
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    You can provide a description, supporting documents, or both.
                  </p>
                </div>

                <div className="rounded-2xl bg-primary/5 p-4 border border-primary/15">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">
                    Supporting Documents (Optional if description is typed)
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                    Upload PDF or evidence documents if you prefer not to write a long description.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,application/pdf"
                    className="sr-only"
                    id="step3-file-upload"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="step3-file-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
                  >
                    <Upload className="size-4" />
                    {files.length > 0 ? `Attached (${files.length} files)` : "Upload PDF / Documents"}
                  </label>
                </div>

                {!hasValidInput && (
                  <div className="rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/25 text-xs font-medium text-amber-700 dark:text-amber-400">
                    ⚠️ Please describe your complaint or upload a supporting document.
                  </div>
                )}
              </div>
            ) : null}

            {/* Step 4: Evidence */}
            {step === 4 ? (
              <div>
                <p className="text-base font-bold text-foreground">{t("file.upload.title")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("file.upload.help")}</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,application/pdf"
                  className="sr-only"
                  id="file-upload"
                  onChange={handleFileSelect}
                />

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label
                    htmlFor="file-upload"
                    className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-background/50 text-sm font-medium hover:bg-background/80"
                  >
                    <Upload className="size-6 text-primary" aria-hidden="true" />
                    {t("file.upload.browse")}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecording(true);
                      window.setTimeout(() => setRecording(false), 1400);
                    }}
                    className={cn(
                      "flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-background/50 text-sm font-medium hover:bg-background/80",
                      recording && "border-destructive text-destructive",
                    )}
                  >
                    <Mic className="size-6 text-accent" aria-hidden="true" />
                    {recording ? t("file.recording") : t("file.record")}
                  </button>
                </div>

                {files.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {files.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-background/60 px-4 py-3"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                          {f.kind === "image" ? (
                            <ImageIcon className="size-4" aria-hidden="true" />
                          ) : f.kind === "video" ? (
                            <Video className="size-4" aria-hidden="true" />
                          ) : f.kind === "pdf" ? (
                            <FileText className="size-4" aria-hidden="true" />
                          ) : (
                            <Mic className="size-4" aria-hidden="true" />
                          )}
                        </span>
                        <span className="truncate text-sm font-semibold">{f.name}</span>
                        <GlassButton
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${f.name}`}
                          onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                        >
                          <X className="size-4" aria-hidden="true" />
                        </GlassButton>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {!hasValidInput && (
                  <div className="mt-4 rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/25 text-xs font-medium text-amber-700 dark:text-amber-400">
                    ⚠️ Please describe your complaint or upload a supporting document.
                  </div>
                )}
              </div>
            ) : null}

            {/* Step 5: AI Preview */}
            {step === 5 ? (
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-accent" aria-hidden="true" />
                  <h2 className="text-base font-bold">{t("file.s6")}</h2>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Field label={t("file.ai.dept")} value={dept ? t(dept.nameKey) : "—"} />
                  <Field label={t("file.ai.eta")} value={`${ai.etaDays.toFixed(1)} ${t("stats.days")}`} />
                  <div className="rounded-2xl bg-background/60 p-4">
                    <dt className="text-xs text-muted-foreground">{t("file.ai.priority")}</dt>
                    <dd className="mt-2">
                      <PriorityBadge level={ai.priority} label={t(`common.priority.${ai.priority}`)} />
                    </dd>
                  </div>
                  <div className="rounded-2xl bg-background/60 p-4">
                    <dt className="text-xs text-muted-foreground">{t("file.ai.severity")}</dt>
                    <dd className="mt-2 font-display text-lg font-extrabold tabular-nums">
                      {ai.severity}/100
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 rounded-2xl bg-accent/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{t("file.ai.confidence")}</p>
                    <p className="font-display text-lg font-extrabold text-gradient-brand tabular-nums">
                      {ai.confidence}%
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary transition-[width] duration-1000"
                      style={{ width: `${ai.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-background/60 p-4">
                  <p className="text-xs text-muted-foreground">{t("file.desc.label")}</p>
                  <p className="mt-1.5 text-sm leading-relaxed">
                    {description.trim() ? (
                      description
                    ) : (
                      <span className="italic text-muted-foreground font-medium">
                        (No text description provided — PDF/document attached)
                      </span>
                    )}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {category} · {district} · {address} {files.length > 0 ? `· ${files.length} file(s) attached` : ""}
                  </p>
                </div>

                {/* n8n + Gemini Webhook Analysis Card */}
                <div className="mt-4 rounded-2xl border border-primary/20 bg-background/80 p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-bold text-gradient-brand flex items-center gap-2">
                      <Sparkles className="size-4 text-accent" />
                      Live AI Analysis (n8n Webhook)
                    </h3>
                    <GlassButton
                      type="button"
                      variant="glass"
                      size="sm"
                      className="rounded-xl text-xs"
                      disabled={aiAnalyzing}
                      onClick={handleRunN8nAnalysis}
                    >
                      {aiAnalyzing ? (
                        <><Loader2 className="size-3.5 animate-spin" /> Analyzing…</>
                      ) : (
                        <><Sparkles className="size-3.5" /> Analyze with n8n AI</>
                      )}
                    </GlassButton>
                  </div>

                  {n8nError && (
                    <p className="mt-3 text-xs font-medium text-destructive bg-destructive/10 p-3 rounded-xl">
                      {n8nError}
                    </p>
                  )}

                  {n8nResult && (
                    <div className="mt-4 space-y-3 rounded-xl bg-secondary/10 p-4 text-xs">
                      {n8nResult.summary && (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Summary</p>
                          <p className="font-medium text-sm mt-0.5">{n8nResult.summary}</p>
                        </div>
                      )}
                      {n8nResult.issue && (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Issue</p>
                          <p className="font-medium text-sm mt-0.5">{n8nResult.issue}</p>
                        </div>
                      )}
                      {n8nResult.department && (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Department</p>
                          <p className="font-semibold text-sm text-primary mt-0.5">{n8nResult.department}</p>
                        </div>
                      )}
                      {n8nResult.reason && (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">AI Reason</p>
                          <p className="text-muted-foreground leading-relaxed mt-0.5">{n8nResult.reason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="mt-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                    {submitError}
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:justify-between">
              <GlassButton
                type="button"
                variant="ghost"
                className="rounded-2xl"
                disabled={step === 0 || submitting}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {t("file.back")}
              </GlassButton>
              {step < stepKeys.length - 1 ? (
                <GlassButton
                  type="button"
                  className="rounded-2xl"
                  disabled={!canContinue}
                  onClick={() => setStep((s) => s + 1)}
                >
                  {t("file.next")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </GlassButton>
              ) : (
                <GlassButton
                  type="button"
                  className="rounded-2xl"
                  disabled={submitting}
                  onClick={submit}
                >
                  {submitting ? (
                    <><Loader2 className="size-4 animate-spin" /> Submitting…</>
                  ) : (
                    <><CircleCheckBig className="size-4" aria-hidden="true" /> {t("file.submit")}</>
                  )}
                </GlassButton>
              )}
            </div>
          </GlassCard>
        </div>
      </Reveal>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-background/60 p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-sm font-semibold">{value}</dd>
    </div>
  );
}
