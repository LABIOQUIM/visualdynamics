import { createFileRoute } from "@tanstack/react-router";

import { DropFileButton } from "./-components/DropFileButton";
import { ImportTable } from "./-components/ImportTable";
import { useSimulationImporter } from "./-components/Provider";

import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/_protected/admin/tools/simulation-importer/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { simulations, users } = useSimulationImporter();

  return (
    <PageLayout title="Simulation Importer">
      {simulations.length > 0 && users.length > 0 ? (
        <ImportTable />
      ) : (
        <DropFileButton />
      )}
    </PageLayout>
  );
}
