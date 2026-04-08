import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { createRoot } from "react-dom/client";
import { Loader, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { OpenFeature, OpenFeatureProvider } from "@openfeature/react-sdk";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import { authClient } from "./lib/auth-client";
import { ApiFeatureFlagProvider } from "./lib/feature-flags";
import { queryClient, router } from "./lib/router";
import { theme } from "./theme";

// Initialize OpenFeature with the API-backed provider
OpenFeature.setProvider(new ApiFeatureFlagProvider());

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
      <OpenFeatureProvider>
        <App />
      </OpenFeatureProvider>
    </MantineProvider>
  );
}

createRoot(document.getElementById("app")!).render(<MainApp />);
