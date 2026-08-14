import { BrainCircuit, Route as RouteIcon, Activity, Eye } from "lucide-react";

import { GlassCard, Reveal, SectionHeading } from "@/components/glass";
import { useI18n } from "@/lib/i18n";

const cards = [
  { n: 1, Icon: BrainCircuit, tint: "from-accent/30 to-primary/20" },
  { n: 2, Icon: RouteIcon, tint: "from-primary/30 to-secondary/20" },
  { n: 3, Icon: Activity, tint: "from-secondary/30 to-accent/20" },
  { n: 4, Icon: Eye, tint: "from-warning/30 to-primary/20" },
];

export function WhyPlatform() {
  const { t } = useI18n();

  return (
    <section className="px-4 py-24 sm:px-6 sm:py-28">
      <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} />
      <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ n, Icon, tint }, i) => (
          <Reveal key={n} delay={i * 0.08}>
            <GlassCard className="glow-ring h-full p-7">
              <span
                className={`grid size-14 place-items-center rounded-3xl bg-gradient-to-br ${tint} text-primary shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_70%,transparent)]`}
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-lg font-bold text-balance">{t(`why.${n}.title`)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(`why.${n}.body`)}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
