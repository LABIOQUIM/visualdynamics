import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { Loader, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { render } from "preact";

import { authClient } from "./lib/auth-client";
import { routeTree } from "./routeTree.gen";
import { theme } from "./theme";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: {
    auth: null,
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return <Loader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider context={{ auth: data }} router={router} />
    </QueryClientProvider>
  );
}

function MainApp() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <App />
    </MantineProvider>
  );
}

render(<MainApp />, document.getElementById("app")!);
