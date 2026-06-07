import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/simulations")({
  component: RouteComponent,
  staticData: {
    breadcrumb: "Simulations",
  },
});

function RouteComponent() {
  return <Outlet />;
}
