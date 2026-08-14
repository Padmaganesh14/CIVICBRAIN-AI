import { Check, Loader2 } from "lucide-react";

import { stageOrder, type StageKey } from "@/data/complaints";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ComplaintTimeline({
  stage,
  events,
}: {
  stage: StageKey;
  events?: { stage: StageKey; at: string; note: string }[];
}) {
  const { t } = useI18n();
  const currentIndex = stageOrder.indexOf(stage);

  return (
    <ol className="relative">
      {stageOrder.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const event = events?.find((e) => e.stage === s);
        return (
          <li key={s} className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-4 pb-7 last:pb-0">
            {i < stageOrder.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-9 bottom-0 left-[17px] w-px",
                  done ? "bg-gradient-to-b from-secondary to-primary" : "bg-border",
                )}
              />
            ) : null}
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full border transition-colors",
                done && "border-transparent bg-secondary text-secondary-foreground",
                active && "border-transparent bg-primary text-primary-foreground animate-pulse-ring",
                !done && !active && "border-border bg-background text-muted-foreground",
              )}
            >
              {done ? (
                <Check className="size-4" aria-hidden="true" />
              ) : active ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <span className="size-2 rounded-full bg-current" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 pt-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  !done && !active && "text-muted-foreground",
                )}
              >
                {t(s)}
              </p>
              {event ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{event.at}</span> · {event.note}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
