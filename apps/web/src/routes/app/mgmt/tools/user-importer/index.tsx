import { createFileRoute } from "@tanstack/react-router";

import { DropFileButton } from "./-components/DropFileButton";
import { ImportTable } from "./-components/ImportTable";
import { useUserImporter } from "./-components/Provider";

import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/app/mgmt/tools/user-importer/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { users } = useUserImporter();

  return (
    <PageLayout title="User Importer">
      {users.length > 0 ? <ImportTable /> : <DropFileButton />}
    </PageLayout>
  );
}
