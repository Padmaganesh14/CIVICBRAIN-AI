import { Link, useNavigate } from "@tanstack/react-router";
import { Languages, LogOut, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AiAssistantPanel } from "@/components/app/ai-assistant-panel";
import { NotificationCenter } from "@/components/app/notification-center";
import { GlassButton } from "@/components/glass";
import { useI18n } from "@/lib/i18n";
import { signOut, validateSession, useSession } from "@/lib/session";
import type { Complaint } from "@/data/complaints";

export function AppShell({
  children,
  role,
  aiComplaint,
}: {
  children: ReactNode;
  role: "citizen" | "officer";
  aiComplaint?: Complaint;
}) {
  const { t, lang, toggle } = useI18n();
  const navigate = useNavigate();
  const { user, ready } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const validated = useRef(false);

  // On first mount: validate token server-side (GET /api/auth/me)
  useEffect(() => {
    if (validated.current) return;
    validated.current = true;
    validateSession().catch(() => {
      // validation failed — user will be redirected below
    });
  }, []);

  // Route protection
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      // Not authenticated → redirect to appropriate login
      void navigate({ to: role === "officer" ? "/officer/login" : "/login" });
      return;
    }
    // Citizen cannot access officer portal
    if (role === "officer" && user.role !== "officer") {
      toast.error("Access denied. Officer accounts only.");
      void navigate({ to: "/citizen" });
      return;
    }
    // Officer cannot access citizen portal
    if (role === "citizen" && user.role !== "citizen") {
      toast.error("Access denied. Citizen accounts only.");
      void navigate({ to: "/officer" });
    }
  }, [ready, user, navigate, role]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(); // calls POST /api/auth/logout then clears local state
      toast.success("You have been logged out.");
      void navigate({ to: "/" });
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  // Show loading until auth state is resolved
  if (!ready || !user) {
    return (
      <div className="aurora-bg flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aurora-bg min-h-dvh">
      <header className="sticky top-0 z-40 px-2 pt-2 sm:px-6 sm:pt-5">
        <div className="glass-surface-strong mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center h-8 sm:h-10 px-2 sm:px-2.5 rounded-xl bg-white/10 border border-white/20 shadow-xs shrink-0">
              <img
                src="/image.png"
                alt="GrievancePilot AI Logo"
                className="h-5 sm:h-7 w-auto max-w-[100px] sm:max-w-[130px] object-contain drop-shadow-xs"
              />
            </div>
            <span className="hidden min-w-0 leading-tight xs:block">
              <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("brand.gov")}
              </span>
              <span className="block truncate font-display text-xs sm:text-sm font-bold text-gradient-brand">
                GrievancePilot AI
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* User info pill */}
            <div className="hidden items-center gap-2 rounded-full bg-background/55 px-3 py-1.5 sm:flex">
              <span
                className={`size-2 shrink-0 rounded-full ${
                  user.role === "officer" ? "bg-accent" : "bg-secondary"
                }`}
              />
              <span className="max-w-[120px] md:max-w-[140px] truncate text-[11px] font-semibold">
                {user.name}
              </span>
              {user.department && (
                <span className="truncate text-[11px] text-muted-foreground">
                  · {user.department}
                </span>
              )}
            </div>

            <GlassButton variant="ghost" size="sm" onClick={toggle} aria-label={t("nav.lang")} className="px-2.5 text-xs h-8 sm:h-9">
              <Languages className="size-3.5 sm:size-4" aria-hidden="true" />
              <span className="font-semibold">{lang === "en" ? "தமிழ்" : "EN"}</span>
            </GlassButton>
            <NotificationCenter />
            <AiAssistantPanel {...(aiComplaint ? { complaint: aiComplaint } : {})} />
            <GlassButton
              variant="glass"
              size="icon"
              className="size-8 sm:size-9"
              aria-label={t("dash.logout")}
              disabled={loggingOut}
              onClick={handleLogout}
            >
              {loggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4 sm:size-4.5" aria-hidden="true" />
              )}
            </GlassButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-20">{children}</main>
    </div>
  );
}
