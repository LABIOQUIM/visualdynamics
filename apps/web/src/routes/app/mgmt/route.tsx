import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { isAdminSession } from "@/lib/auth-session";

export const Route = createFileRoute("/app/mgmt")({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();

    if (!isAdminSession(session.data)) {
      throw redirect({
        to: "/app",
        replace: true,
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
