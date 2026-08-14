import { createFileRoute } from "@tanstack/react-router";

import { DepartmentsSection } from "@/components/landing/departments-section";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsSection } from "@/components/landing/stats-section";
import { Testimonials } from "@/components/landing/testimonials";
import { WhyPlatform } from "@/components/landing/why-platform";
import { FloatingNav } from "@/components/site/floating-nav";
import { SiteFooter } from "@/components/site/site-footer";

const title = "GrievancePilot AI | TN Smart Grievance";
const description =
  "File complaints, track progress and experience transparent governance powered by AI across nine Tamil Nadu departments.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="aurora-bg min-h-dvh">
      <FloatingNav />
      <main>
        <Hero />
        <HowItWorks />
        <WhyPlatform />
        <DepartmentsSection />
        <StatsSection />
        <Testimonials />
      </main>
      <SiteFooter />
    </div>
  );
}
