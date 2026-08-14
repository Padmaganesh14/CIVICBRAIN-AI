import { motion, useScroll, useSpring, useTransform } from "motion/react";
import {
  FileText,
  BrainCircuit,
  ListTree,
  Send,
  ClipboardCheck,
  Wrench,
  Radar,
} from "lucide-react";
import { useRef } from "react";

import { GlassCard, Reveal, SectionHeading } from "@/components/glass";
import { useI18n } from "@/lib/i18n";

const steps = [
  { n: 1, Icon: FileText },
  { n: 2, Icon: BrainCircuit },
  { n: 3, Icon: ListTree },
  { n: 4, Icon: Send },
  { n: 5, Icon: ClipboardCheck },
  { n: 6, Icon: Wrench },
  { n: 7, Icon: Radar },
];

export function HowItWorks() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });
  const glow = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    <section id="how-it-works" className="scroll-mt-28 px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow={t("how.eyebrow")} title={t("how.title")} subtitle={t("how.subtitle")} />

      <div ref={ref} className="relative mx-auto mt-16 max-w-4xl">
        {/* connecting line */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[27px] w-px bg-border sm:left-1/2 sm:-translate-x-1/2"
        >
          <motion.div
            style={{ scaleY: lineScale, opacity: glow }}
            className="h-full w-full origin-top bg-gradient-to-b from-primary via-accent to-secondary"
          />
        </div>

        <ol className="space-y-8 sm:space-y-14">
          {steps.map(({ n, Icon }, i) => (
            <li
              key={n}
              className={
                "relative flex gap-5 sm:grid sm:grid-cols-2 sm:items-center sm:gap-10 " +
                (i % 2 === 1 ? "sm:[&>*:first-child]:order-2" : "")
              }
            >
              <Reveal delay={0.05} className={i % 2 === 1 ? "sm:col-start-2" : ""}>
                <GlassCard className="p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 text-primary shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_60%,transparent)]">
                      <Icon className="size-5.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                        {t("file.step")} {n}
                      </p>
                      <h3 className="truncate text-base font-bold sm:text-lg">
                        {t(`how.${n}.title`)}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {t(`how.${n}.body`)}
                  </p>
                </GlassCard>
              </Reveal>

              <span
                aria-hidden="true"
                className="absolute top-7 left-[19px] grid size-4 place-items-center rounded-full bg-background ring-4 ring-background sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
              >
                <span className="size-3 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse-ring" />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
