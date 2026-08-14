import { AnimatedCounter, GlassCard, Reveal, SectionHeading } from "@/components/glass";
import { useI18n } from "@/lib/i18n";

export function StatsSection() {
  const { t } = useI18n();

  const stats = [
    { key: "stats.resolved", value: 1284630, suffix: "+", decimals: 0 },
    { key: "stats.accuracy", value: 96.4, suffix: "%", decimals: 1 },
    { key: "stats.departments", value: 9, suffix: "", decimals: 0 },
    { key: "stats.avgtime", value: 3.2, suffix: ` ${t("stats.days")}`, decimals: 1 },
    { key: "stats.satisfaction", value: 94.1, suffix: "%", decimals: 1 },
  ];

  return (
    <section className="px-3 py-14 sm:px-6 sm:py-24 lg:py-28">
      <SectionHeading eyebrow={t("stats.eyebrow")} title={t("stats.title")} />
      <div className="mx-auto mt-8 sm:mt-14 grid max-w-6xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <Reveal key={s.key} delay={i * 0.07}>
            <GlassCard className="h-full p-3.5 sm:p-6 text-center">
              <p className="font-display text-2xl font-extrabold text-gradient-brand sm:text-3xl lg:text-4xl">
                <AnimatedCounter value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </p>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-muted-foreground text-balance">
                {t(s.key)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
