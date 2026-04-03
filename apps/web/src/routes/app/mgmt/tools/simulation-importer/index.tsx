import { createFileRoute } from "@tanstack/react-router";

import { DropFileButton } from "./-components/DropFileButton";
import { ImportTable } from "./-components/ImportTable";
import { useSimulationImporter } from "./-components/Provider";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/app/mgmt/tools/simulation-importer/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { simulations, users } = useSimulationImporter();

  return (
    <PageLayout>
      <Heading title="Simulation Importer" />
      {simulations.length > 0 && users.length > 0 ? (
        <ImportTable />
      ) : (
        <DropFileButton />
      )}
    </PageLayout>
  );
}
