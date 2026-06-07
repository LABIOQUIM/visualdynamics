import { createFileRoute } from "@tanstack/react-router";

import { ComposePanel } from "./-components/ComposePanel";

import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/_protected/admin/tools/batch-email/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageLayout title="Batch Email">
      <ComposePanel />
    </PageLayout>
  );
}
