import "./__root.module.css";

import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

import { authClient } from "@/lib/auth-client";
import { SITE_URL } from "@/lib/seo";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(utc);

export type RouterContext = {
  auth: typeof authClient.$Infer.Session | null;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "theme-color", content: "#0b1625" },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "alternate", href: `${SITE_URL}/sitemap.xml`, type: "application/xml", title: "Sitemap" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {!import.meta.env.SSR ? <HeadContent /> : null}
      <Outlet />
    </>
  );
}
