import { Link } from "@tanstack/react-router";
import { Sparkles, Languages, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { GlassButton, GlassCard } from "@/components/glass";
import { useI18n } from "@/lib/i18n";
import authBackdrop from "@/assets/auth-backdrop.jpg";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t, lang, toggle } = useI18n();

  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <img
        src={authBackdrop}
        alt=""
        aria-hidden="true"
        width={1536}
        height={1024}
        className="absolute inset-0 -z-10 size-full scale-110 object-cover blur-2xl"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-background/80 via-background/60 to-background/85"
        aria-hidden="true"
      />

      <div className="flex min-h-dvh flex-col px-4 py-6 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{t("nav.home")}</span>
          </Link>
          <GlassButton variant="glass" size="sm" onClick={toggle} aria-label={t("nav.lang")}>
            <Languages className="size-4" aria-hidden="true" />
            {lang === "en" ? "தமிழ்" : "EN"}
          </GlassButton>
        </div>

        <main className="flex flex-1 items-center justify-center py-10">
          <GlassCard className="w-full max-w-md p-7 sm:p-9">
            {/* Prominent GrievancePilot AI Logo */}
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center px-4 py-3 rounded-3xl bg-white/10 backdrop-blur-md border border-white/25 shadow-lg">
                <img
                  src="/image.png"
                  alt="GrievancePilot AI"
                  className="w-[150px] sm:w-[180px] md:w-[210px] h-auto max-h-[95px] object-contain drop-shadow"
                />
              </div>
              <p className="mt-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {t("brand.gov")}
              </p>
              <p className="font-display text-lg font-extrabold text-gradient-brand">
                GrievancePilot AI
              </p>
            </div>

            <h1 className="mt-6 text-2xl font-extrabold text-center">{title}</h1>
            <p className="mt-2 text-sm text-center text-muted-foreground">{subtitle}</p>

            <div className="mt-7">{children}</div>

            {footer}
          </GlassCard>
        </main>
      </div>
    </div>
  );
}
