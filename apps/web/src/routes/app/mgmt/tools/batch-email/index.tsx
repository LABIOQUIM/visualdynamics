import { createFileRoute } from "@tanstack/react-router";

import { ComposePanel } from "./-components/ComposePanel";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/app/mgmt/tools/batch-email/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageLayout>
      <Heading title="Batch Email" />
      <ComposePanel />
    </PageLayout>
  );
}
