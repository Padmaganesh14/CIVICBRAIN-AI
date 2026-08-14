import { Link } from "@tanstack/react-router";
import { Sparkles, Phone, Mail, MapPin, Facebook, Twitter, Youtube, Instagram } from "lucide-react";

import { useI18n } from "@/lib/i18n";

const emergency = [
  { key: "footer.police", number: "100" },
  { key: "footer.ambulance", number: "108" },
  { key: "footer.fire", number: "101" },
  { key: "footer.helpline", number: "1100" },
];

const socials = [
  { label: "Facebook", Icon: Facebook },
  { label: "X", Icon: Twitter },
  { label: "YouTube", Icon: Youtube },
  { label: "Instagram", Icon: Instagram },
];

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="relative mt-24 px-4 pb-10 sm:px-6">
      <div className="glass-surface mx-auto max-w-6xl rounded-4xl p-8 sm:p-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/image.png"
                alt="GrievancePilot AI Logo"
                className="size-11 shrink-0 object-contain rounded-2xl bg-white/10 p-0.5 border border-white/20 shadow-sm"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{t("brand.gov")}</p>
                <p className="font-display text-base font-bold text-gradient-brand">GrievancePilot AI</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <nav aria-labelledby="footer-platform">
            <h2 id="footer-platform" className="text-sm font-semibold">
              {t("footer.platform")}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/" hash="how-it-works" className="hover:text-foreground">
                  {t("nav.how")}
                </Link>
              </li>
              <li>
                <Link to="/" hash="departments" className="hover:text-foreground">
                  {t("nav.departments")}
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-foreground">
                  {t("nav.track")}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground">
                  {t("nav.citizen")}
                </Link>
              </li>
              <li>
                <Link to="/officer/login" className="hover:text-foreground">
                  {t("nav.officer")}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className="text-sm font-semibold">
              {t("footer.legal")}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>{t("footer.privacy")}</li>
              <li>{t("footer.terms")}</li>
              <li>{t("footer.accessibility")}</li>
              <li>{t("footer.rti")}</li>
            </ul>
            <h2 className="mt-6 text-sm font-semibold">{t("footer.emergency")}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {emergency.map((e) => (
                <li key={e.key} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t(e.key)}</span>
                  <a
                    href={`tel:${e.number}`}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary tabular-nums"
                  >
                    {e.number}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold">{t("footer.contact")}</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>Secretariat, Fort St George, Chennai 600009</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>044-2567 0000</span>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>grievance@tn.gov.in</span>
              </li>
            </ul>
            <h2 className="mt-6 text-sm font-semibold">{t("footer.social")}</h2>
            <ul className="mt-3 flex gap-2">
              {socials.map(({ label, Icon }) => (
                <li key={label}>
                  <a
                    href="#"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-2xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="size-4.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {t("footer.rights")}</p>
          <p>{t("common.demo")}</p>
        </div>
      </div>
    </footer>
  );
}
