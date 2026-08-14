import { Star, Quote } from "lucide-react";

import { GlassCard, Reveal, SectionHeading } from "@/components/glass";
import { useI18n } from "@/lib/i18n";

const people = [
  { n: 1, rating: 5, tint: "from-primary to-accent" },
  { n: 2, rating: 5, tint: "from-secondary to-primary" },
  { n: 3, rating: 4, tint: "from-accent to-secondary" },
  { n: 4, rating: 5, tint: "from-primary to-secondary" },
];

export function Testimonials() {
  const { t } = useI18n();

  return (
    <section className="px-4 py-24 sm:px-6 sm:py-28">
      <SectionHeading eyebrow={t("testimonials.eyebrow")} title={t("testimonials.title")} />
      <ul className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2">
        {people.map((p, i) => {
          const name = t(`t${p.n}.name`);
          return (
            <li key={p.n}>
              <Reveal delay={(i % 2) * 0.08}>
                <GlassCard className="glow-ring h-full p-7">
                  <Quote className="size-7 text-primary/40" aria-hidden="true" />
                  <p className="mt-4 text-base leading-relaxed text-pretty">
                    “{t(`t${p.n}.quote`)}”
                  </p>
                  <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${p.tint} font-display text-sm font-bold text-primary-foreground`}
                      aria-hidden="true"
                    >
                      {name.slice(0, 1)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t(`t${p.n}.place`)}
                      </span>
                    </span>
                    <span className="flex shrink-0 gap-0.5" aria-label={`${p.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={
                            s < p.rating
                              ? "size-3.5 fill-warning text-warning"
                              : "size-3.5 text-border"
                          }
                          aria-hidden="true"
                        />
                      ))}
                    </span>
                  </div>
                </GlassCard>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
