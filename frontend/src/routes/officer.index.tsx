import { createFileRoute } from "@tanstack/react-router";
import { OfficerPortalShell } from "@/components/officer/OfficerPortalShell";

const title = "Officer Portal | CivicFund AI — Tamil Nadu Municipal Administration";
const description =
  "Dynamic workspace and intelligence portal for authorised Tamil Nadu department officers.";

export const Route = createFileRoute("/officer/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OfficerPortalShell,
});
