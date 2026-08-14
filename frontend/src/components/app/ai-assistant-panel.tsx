import { Bot } from "lucide-react";

import { GlassButton, PriorityBadge } from "@/components/glass";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { departments } from "@/data/departments";
import { complaints, type Complaint } from "@/data/complaints";
import { useI18n } from "@/lib/i18n";

export function AiAssistantPanel({ complaint }: { complaint?: Complaint }) {
  const { t } = useI18n();
  const target = complaint ?? complaints[0]!;
  const dept = departments.find((d) => d.id === target.departmentId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <GlassButton variant="accent" size="icon" aria-label={t("ai.open")}>
          <Bot className="size-4.5" aria-hidden="true" />
        </GlassButton>
      </SheetTrigger>
      <SheetContent className="glass-surface-strong w-full gap-0 overflow-y-auto border-l-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground">
              <Bot className="size-4" aria-hidden="true" />
            </span>
            {t("ai.panel")}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-3 p-4">
          <div className="glass-surface rounded-2xl p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {t("ai.summary")}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{target.aiSummary}</p>
          </div>

          <div className="glass-surface rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{t("ai.confidence")}</p>
              <p className="font-display text-lg font-extrabold text-gradient-brand tabular-nums">
                {target.confidence}%
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary transition-[width] duration-1000"
                style={{ width: `${target.confidence}%` }}
              />
            </div>
          </div>

          <dl className="grid gap-2">
            <Row label={t("ai.category")} value={target.category} />
            <Row label={t("ai.dept")} value={dept ? t(dept.nameKey) : "—"} />
            <Row label={t("ai.officer")} value={target.officer} />
            <Row label={t("ai.sentiment")} value={target.sentiment} />
            <Row label={t("ai.eta")} value={target.eta} />
            <Row label={t("ai.risk")} value={target.risk} />
            <Row
              label={t("ai.duplicate")}
              value={
                target.duplicates > 0
                  ? `${target.duplicates} linked reports`
                  : "No duplicates detected"
              }
            />
          </dl>

          <div className="glass-surface flex items-center justify-between gap-3 rounded-2xl p-4">
            <p className="text-sm font-semibold">{t("ai.priority")}</p>
            <PriorityBadge
              level={target.priority}
              label={t(`common.priority.${target.priority}`)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-4 py-3">
      <dt className="min-w-0 truncate text-xs text-muted-foreground">{label}</dt>
      <dd className="max-w-[60%] truncate text-right text-sm font-medium">{value}</dd>
    </div>
  );
}
