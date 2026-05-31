import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter, type RouterHistory } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";
import { routeTree } from "@/routeTree.gen";

function isSessionInvalidError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return /\b401\b/i.test(message) || /\b(unauthenticated|unauthorized)\b/i.test(message);
}

async function handleUnauthorizedQueryError(queryClient: QueryClient, error: unknown) {
  if (typeof window === "undefined" || !isSessionInvalidError(error)) {
    return;
  }

  queryClient.clear();

  if (window.location.pathname.startsWith("/app")) {
    try {
      await authClient.signOut();
    } finally {
      window.location.replace("/auth/login");
    }
  }
}

interface GetRouterOptions {
  history?: RouterHistory;
}

export function getRouter(options: GetRouterOptions = {}) {
  let queryClient: QueryClient;

  const queryCache = new QueryCache({
    onError: (error) => void handleUnauthorizedQueryError(queryClient, error),
  });

  queryClient = new QueryClient({
    queryCache,
    defaultOptions: {
      queries: {
        gcTime: 300_000,
        refetchOnWindowFocus: false,
        staleTime: 30_000,
      },
    },
  });

  return createRouter({
    ...(options.history ? { history: options.history } : {}),
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
    defaultStaleTime: 30_000,
    scrollRestoration: true,
    context: {
      queryClient,
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
