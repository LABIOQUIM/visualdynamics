import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin/tools")({
  component: RouteComponent,
  staticData: {
    breadcrumb: "Tools",
  },
});

function RouteComponent() {
  return <Outlet />;
}
