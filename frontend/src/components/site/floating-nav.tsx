import { Link } from "@tanstack/react-router";
import { Menu, X, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { GlassButton, glassButtonClass } from "@/components/glass";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const sectionLinks = [
  { key: "nav.how", hash: "how-it-works" },
  { key: "nav.departments", hash: "departments" },
];

export function FloatingNav() {
  const { t, lang, toggle } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const { scrollY } = useScroll();
  const navBlur = useTransform(scrollY, [0, 300], ["blur(10px)", "blur(24px)"]);
  const navShadow = useTransform(
    scrollY,
    [0, 300],
    ["0 4px 16px rgba(0, 0, 0, 0.04)", "0 12px 36px rgba(0, 0, 0, 0.18)"]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <motion.nav
        aria-label="Primary"
        style={reduce ? {} : { backdropFilter: navBlur, boxShadow: navShadow }}
        className={cn(
          "mx-auto flex max-w-6xl items-center gap-3 rounded-full px-3 py-2 transition-colors duration-500 sm:px-4",
          scrolled ? "glass-surface-strong" : "glass-surface",
        )}
      >
        <Link
          to="/"
          className="flex min-w-0 items-center gap-3 rounded-full py-1 pr-3 pl-1.5"
          aria-label={`${t("brand.gov")} — GrievancePilot AI`}
        >
          <div className="flex items-center justify-center h-10 px-2.5 rounded-xl bg-white/10 border border-white/20 shadow-sm shrink-0">
            <img
              src="/image.png"
              alt="GrievancePilot AI Logo"
              className="h-7 w-auto max-w-[130px] object-contain drop-shadow-sm"
            />
          </div>
          <span className="hidden min-w-0 leading-tight sm:block">
            <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("brand.gov")}
            </span>
            <span className="block truncate font-display text-sm font-bold text-gradient-brand">
              GrievancePilot AI
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          <Link
            to="/"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("nav.home")}
          </Link>
          {sectionLinks.map((l) => (
            <Link
              key={l.hash}
              to="/"
              hash={l.hash}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {t(l.key)}
            </Link>
          ))}
          <Link
            to="/track"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("nav.track")}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label={t("nav.lang")}
            className="gap-1.5 px-3"
          >
            <Languages className="size-4" aria-hidden="true" />
            <span className="font-semibold">{lang === "en" ? "தமிழ்" : "EN"}</span>
          </GlassButton>
          <Link
            to="/officer/login"
            className={glassButtonClass({ variant: "glass", size: "sm" }, "hidden sm:inline-flex")}
          >
            {t("nav.officer")}
          </Link>
          <Link
            to="/login"
            className={glassButtonClass({ variant: "primary", size: "sm" }, "hidden sm:inline-flex")}
          >
            {t("nav.citizen")}
          </Link>
          <GlassButton
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-expanded={open}
            aria-label={open ? t("nav.close") : t("nav.menu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </GlassButton>
        </div>
      </motion.nav>

      {open ? (
        <div className="glass-surface-strong mx-auto mt-2 max-w-6xl rounded-3xl p-3 lg:hidden">
          <ul className="flex flex-col">
            {[
              { key: "nav.home", to: "/" as const },
              { key: "nav.track", to: "/track" as const },
              { key: "nav.officer", to: "/officer/login" as const },
              { key: "nav.citizen", to: "/login" as const },
            ].map((l) => (
              <li key={l.key}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-2xl px-4 text-sm font-medium hover:bg-muted"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
            {sectionLinks.map((l) => (
              <li key={l.hash}>
                <Link
                  to="/"
                  hash={l.hash}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-2xl px-4 text-sm font-medium hover:bg-muted"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
