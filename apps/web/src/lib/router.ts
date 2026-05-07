import { QueryClient } from "@tanstack/react-query";
import { createRouter, type RouterHistory } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";

export function createAppRouter(history?: RouterHistory) {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    ...(history ? { history } : {}),
    context: {
      auth: null,
      queryClient,
    },
  });

  return {
    queryClient,
    router,
  };
}

export const { router, queryClient } = createAppRouter();
