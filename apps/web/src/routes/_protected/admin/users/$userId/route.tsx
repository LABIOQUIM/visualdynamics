import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin/users/$userId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
