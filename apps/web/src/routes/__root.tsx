import "./__root.module.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";

import type { ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { OpenFeature, OpenFeatureProvider } from "@openfeature/react-sdk";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

import { ApiFeatureFlagProvider } from "@/lib/feature-flags";
import {
  DEFAULT_OG_IMAGE_PATH,
  DEFAULT_SEO_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo";
import { theme } from "@/theme";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(utc);

type RouterContext = {
  queryClient: QueryClient;
};

OpenFeature.setProvider(new ApiFeatureFlagProvider());

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    title: SITE_NAME,
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "description", content: DEFAULT_SEO_DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: "website" },
      { property: "og:image", content: DEFAULT_OG_IMAGE_PATH },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE_PATH },
    ],
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <RootProviders>
        <Outlet />
      </RootProviders>
    </RootDocument>
  );
}

function RootProviders({ children }: Readonly<{ children: ReactNode }>) {
  const { queryClient } = Route.useRouteContext();

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <OpenFeatureProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </OpenFeatureProvider>
    </MantineProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script src="/env-config.js" />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
