import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/app/mgmt")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();

    if (session.data?.user.role !== "admin") {
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
