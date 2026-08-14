# TN Smart Grievance Redressal System — Liquid Glass Prototype

A high-fidelity, fully clickable front-end prototype (mock data, no backend) for the Government of Tamil Nadu AI grievance platform. Apple VisionOS-inspired liquid glass, bilingual English / தமிழ், WCAG-conscious.

## Phase 1 — Design system + public site

**Design foundation**
- Tokens in `src/styles.css`: deep gov blue `#0B4F9F`, TN green `#00A86B`, AI purple `#7B61FF`, emerald success, amber warning, glass surface/border/glow tokens, large radii (20–32px), layered soft shadows.
- SF Pro-like typography via a `<link>` in the root route (Inter Tight / Plus Jakarta display pairing as SF Pro substitute).
- Reusable primitives: `GlassCard`, `GlassButton` (hover glow), `FloatingNav`, `SectionHeading`, `AnimatedCounter`, `StepTimeline`, `Reveal` (scroll-triggered).
- Bilingual layer: a `LanguageProvider` + `t()` dictionary with full English and Tamil copy for every string, persisted to localStorage, toggled from the nav.

**Landing page (`/`)** — replaces the placeholder index
- Cinematic hero: generated image of the Tamil Nadu Secretariat / Chennai skyline with citizens and subtle AI light elements, parallax + glass overlay.
- Headline, subtitle, "File a Grievance" (→ citizen login) and "Track Complaint" CTAs, animated scroll indicator.
- Floating transparent nav: logo, Home, How It Works, Departments, Track Complaint, Officer Login, Citizen Login, EN/தமிழ் switch. Mobile drawer.
- How It Works: 7-step scroll story with animated connecting line and 3D-style icons.
- Why This Platform: 4 glass cards.
- Departments: 9 glass cards with 3D icon, avg resolution time, AI processing indicator.
- Statistics: 5 animated counters that trigger on scroll.
- Testimonials: glass cards with citizen photos and ratings.
- Footer: government branding, Privacy, Terms, Contact, emergency numbers, social links.

**Track Complaint (`/track`)** — lookup by Complaint ID / Tracking Number / Mobile, glass progress timeline (Submitted → AI Analysis → Department Assigned → Officer Review → In Progress → Resolved), estimated completion, live-status pulse.

## Phase 2 — Citizen flows

- `/login` citizen login: blurred TN background, centered glass card, email/mobile, password, remember me, forgot password, create account, OTP login, DigiLocker placeholder, animated security badge.
- `/citizen` dashboard: welcome card, quick actions, file/track shortcuts, previous complaints, notifications, AI suggestions, recent activity widgets.
- `/citizen/file` 6-step grievance flow: department → category → location with map picker (static styled map + pin) → description → media/voice upload → AI analysis preview (predicted department, priority, severity, ETA, confidence). Submission generates complaint ID + tracking number and a success screen.

## Phase 3 — Officer flows

- `/officer/login`: employee ID, password, department select, 2FA step.
- `/officer` dashboard: pending, high-priority, resolved today, avg resolution KPIs; heatmap, department performance, daily trend and priority-distribution charts (Recharts), AI insights panel.
- `/officer/complaints/$id` review page: citizen info, details, evidence, timeline, AI summary, suggested department, priority score, duplicate detection, suggested response, and the full action bar (accept, reassign, request info, reject, resolve, notes, update status).
- AI Assistant slide-over panel and glass Notification Center, available across authenticated screens.

## Technical notes

- TanStack Start file routes; each route gets its own `head()` metadata.
- Mock data lives in `src/data/*.ts`; auth is a simulated client-side session (any credentials work) so all screens are reachable.
- Motion for React handles scroll reveals, parallax, timeline draw, and shared transitions; all animation respects `prefers-reduced-motion`.
- Hero, login backdrops, and 3D-style department/step icons are generated images stored in `src/assets/`.
- Accessibility: semantic landmarks, single `<main>` per route, labeled controls, visible focus rings, ≥44px tap targets, contrast checked against glass surfaces (opaque fallbacks where blur would drop contrast).
