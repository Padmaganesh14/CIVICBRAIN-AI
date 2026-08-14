import { createFileRoute } from "@tanstack/react-router";
import { OfficerPortalShell } from "@/components/officer/OfficerPortalShell";

export const Route = createFileRoute("/officer/root-cause")({
  component: OfficerPortalShell,
});
