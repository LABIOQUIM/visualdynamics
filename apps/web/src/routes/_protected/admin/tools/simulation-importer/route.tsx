import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SimulationImporterProvider } from "./-components/Provider";

export const Route = createFileRoute("/_protected/admin/tools/simulation-importer")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SimulationImporterProvider>
      <Outlet />
    </SimulationImporterProvider>
  );
}
