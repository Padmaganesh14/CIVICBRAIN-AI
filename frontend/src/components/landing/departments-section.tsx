import { Cpu } from "lucide-react";

import { GlassCard, Reveal, SectionHeading } from "@/components/glass";
import { departments } from "@/data/departments";
import { useI18n } from "@/lib/i18n";

export function DepartmentsSection() {
  const { t } = useI18n();

  return (
    <section id="departments" className="scroll-mt-28 px-4 py-24 sm:px-6 sm:py-28">
      <SectionHeading
        eyebrow={t("dept.eyebrow")}
        title={t("dept.title")}
        subtitle={t("dept.subtitle")}
      />
      <ul className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d, i) => (
          <li key={d.id}>
            <Reveal delay={(i % 3) * 0.07}>
              <GlassCard className="glow-ring h-full p-6">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                  <span
                    className={`grid size-14 shrink-0 place-items-center rounded-3xl bg-gradient-to-br ${d.tint} text-primary shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_70%,transparent)]`}
                  >
                    <d.icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold">{t(d.nameKey)}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("dept.avg")}:{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {d.avgDays} {t("stats.days")}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-muted/60 px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <span className="relative grid size-6 place-items-center rounded-full bg-secondary/20 text-secondary-foreground">
                      <Cpu className="size-3.5" aria-hidden="true" />
                    </span>
                    {t("dept.ai")}
                  </span>
                  <span className="text-xs font-bold text-secondary-foreground tabular-nums">
                    {d.accuracy}%
                  </span>
                </div>
              </GlassCard>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
