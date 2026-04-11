import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/mgmt/tools/batch-email")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
