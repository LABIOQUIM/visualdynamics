import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import { authClient } from "@/lib/auth-client";

type RouterContext = {
  auth: typeof authClient.$Infer.Session | null;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  );
}
