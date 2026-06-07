import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin/tools/batch-email")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
