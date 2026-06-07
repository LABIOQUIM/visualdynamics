import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin/users")({
  component: RouteComponent,
  staticData: {
    breadcrumb: "Users",
  },
});

function RouteComponent() {
  return <Outlet />;
}
