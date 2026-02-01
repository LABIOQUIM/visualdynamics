import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/mgmt")({
  beforeLoad: ({ context, location }) => {
    if (context.auth?.user.role !== "admin") {
      throw redirect({
        to: "/app",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
