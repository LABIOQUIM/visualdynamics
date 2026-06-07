import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin/flags")({
  component: RouteComponent,
  staticData: {
    breadcrumb: "Feature Flags",
  },
});

function RouteComponent() {
  return <Outlet />;
}
