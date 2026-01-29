import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

import { authClient } from "@/lib/auth-client";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(utc);

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
