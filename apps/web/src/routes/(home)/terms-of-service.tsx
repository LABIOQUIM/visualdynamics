import { createFileRoute } from "@tanstack/react-router";

import { buildSeoHead, DEFAULT_SITE_URL } from "@/lib/seo";
import { loadRuntimeSeoData } from "@/lib/seo.runtime";

export const Route = createFileRoute("/(home)/terms-of-service")({
  loader: () => loadRuntimeSeoData(),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: "Terms of Service",
      description: "Terms of service for Visual Dynamics.",
      path: "/terms-of-service",
      index: false,
      siteUrl: loaderData?.siteUrl ?? DEFAULT_SITE_URL,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /(home)/terms-of-service!</div>;
}
