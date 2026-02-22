import { createFileRoute, Outlet } from "@tanstack/react-router";

import { UserImporterProvider } from "./-components/Provider";

export const Route = createFileRoute("/app/mgmt/tools/user-importer")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <UserImporterProvider>
      <Outlet />
    </UserImporterProvider>
  );
}
