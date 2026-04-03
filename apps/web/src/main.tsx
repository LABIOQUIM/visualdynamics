import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { createRoot } from "react-dom/client";
import { Loader, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import { authClient } from "./lib/auth-client";
import { queryClient, router } from "./lib/router";
import { theme } from "./theme";

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

createRoot(document.getElementById("app")!).render(<MainApp />);
