import { createFileRoute } from "@tanstack/react-router";

import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/app/mgmt/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PageLayout title="Settings">Hello /app/mgmt/settings!</PageLayout>;
}
