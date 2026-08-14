import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Search, ChevronDown, Sparkles } from "lucide-react";
import { useRef } from "react";

import { glassButtonClass } from "@/components/glass";
import { useI18n } from "@/lib/i18n";
import heroImage from "@/assets/hero-secretariat.jpg";

export function Hero() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Scroll-linked interpolation over 0 to 550px vertical scroll
  const { scrollY } = useScroll();

  // Background transforms
  const bgScale = useTransform(scrollY, [0, 550], [1, 1.10]);
  const bgY = useTransform(scrollY, [0, 550], [0, 60]);
  const bgOpacity = useTransform(scrollY, [0, 500], [1, 0.15]);
  const bgFilter = useTransform(scrollY, [0, 500], ["blur(0px)", "blur(14px)"]);

  // Heading transforms
  const headingY = useTransform(scrollY, [0, 500], [0, -110]);
  const headingScale = useTransform(scrollY, [0, 500], [1, 0.92]);
  const headingOpacity = useTransform(scrollY, [0, 420], [1, 0]);

  // Subtitle transforms
  const subY = useTransform(scrollY, [0, 480], [0, -75]);
  const subOpacity = useTransform(scrollY, [0, 380], [1, 0]);

  // CTA button transforms
  const ctaY = useTransform(scrollY, [0, 420], [0, -50]);
  const ctaOpacity = useTransform(scrollY, [0, 320], [1, 0]);

  // Scroll indicator fade out
  const scrollHintOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  return (
    <section ref={containerRef} className="relative isolate min-h-[92dvh] overflow-hidden">
      {/* Background with scale, opacity dissolve, and blur transition */}
      <motion.div
        className="absolute inset-0 -z-10 will-change-transform"
        style={
          reduce
            ? {}
            : {
                scale: bgScale,
                y: bgY,
                opacity: bgOpacity,
                filter: bgFilter,
              }
        }
      >
        <img
          src={heroImage}
          alt={t("hero.alt")}
          width={1920}
          height={1088}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/45 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_50%_10%,color-mix(in_oklab,var(--color-accent)_18%,transparent),transparent_70%)]" />
      </motion.div>

      <div className="mx-auto flex min-h-[92dvh] max-w-5xl flex-col items-center justify-center px-4 pt-32 pb-24 text-center sm:px-6">
        {/* Badge & Subtitle wrapper with scroll lift & fade */}
        <motion.div
          style={reduce ? {} : { y: subY, opacity: subOpacity }}
          className="flex flex-col items-center will-change-transform"
        >
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-surface-strong inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-primary"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            {t("hero.badge")}
          </motion.span>
        </motion.div>

        {/* Large Heading with scroll scale down, translate upward, and fade out */}
        <motion.div
          style={
            reduce
              ? {}
              : {
                  y: headingY,
                  scale: headingScale,
                  opacity: headingOpacity,
                }
          }
          className="will-change-transform"
        >
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-4xl leading-[1.05] font-extrabold text-balance sm:text-6xl lg:text-7xl"
          >
            <span className="text-gradient-brand">{t("hero.title")}</span>
          </motion.h1>
        </motion.div>

        {/* Subtitle text */}
        <motion.div
          style={reduce ? {} : { y: subY, opacity: subOpacity }}
          className="will-change-transform"
        >
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg"
          >
            {t("hero.subtitle")}
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          style={reduce ? {} : { y: ctaY, opacity: ctaOpacity }}
          className="will-change-transform"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              to="/login"
              className={glassButtonClass({ variant: "primary", size: "lg" }, "w-full sm:w-auto")}
            >
              {t("hero.cta.primary")}
              <ArrowRight className="size-4.5" aria-hidden="true" />
            </Link>
            <Link
              to="/track"
              className={glassButtonClass({ variant: "glass", size: "lg" }, "w-full sm:w-auto")}
            >
              <Search className="size-4.5" aria-hidden="true" />
              {t("hero.cta.secondary")}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        style={reduce ? {} : { opacity: scrollHintOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center gap-2"
      >
        <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {t("hero.scroll")}
        </span>
        <span className="glass-surface grid size-10 place-items-center rounded-full animate-float-soft">
          <ChevronDown className="size-4 text-primary" aria-hidden="true" />
        </span>
      </motion.div>
    </section>
  );
}
