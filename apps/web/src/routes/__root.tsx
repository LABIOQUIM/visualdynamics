import "./__root.module.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";

import type { QueryClient } from "@tanstack/react-query";
import type { ComponentProps, ReactNode } from "react";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { OpenFeature, OpenFeatureProvider } from "@openfeature/react-sdk";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

import { AppErrorBoundary } from "@/components/ErrorBoundary";
import { ApiFeatureFlagProvider } from "@/lib/feature-flags";
import { theme } from "@/theme";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(utc);

type RouterContext = {
  queryClient: QueryClient;
};

OpenFeature.setProvider(new ApiFeatureFlagProvider());

export const Route = createRootRouteWithContext<RouterContext>()({
  errorComponent: RootErrorComponent,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootProviders>
      <Outlet />
    </RootProviders>
  );
}

function RootErrorComponent(props: Readonly<ComponentProps<typeof AppErrorBoundary>>) {
  return (
    <RootProviders>
      <AppErrorBoundary {...props} />
    </RootProviders>
  );
}

function RootProviders({ children }: Readonly<{ children: ReactNode }>) {
  const { queryClient } = Route.useRouteContext();

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <OpenFeatureProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </OpenFeatureProvider>
    </MantineProvider>
  );
}
