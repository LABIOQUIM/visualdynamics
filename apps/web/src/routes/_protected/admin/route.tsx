import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { isAdminSession } from "@/lib/auth-session";

export const Route = createFileRoute("/_protected/admin")({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession();

    if (!isAdminSession(session.data)) {
      throw redirect({
        to: "/simulations",
        replace: true,
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
  staticData: {
    breadcrumb: "Admin",
  },
});

function RouteComponent() {
  return <Outlet />;
}
