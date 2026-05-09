import { createFileRoute } from "@tanstack/react-router";

import { buildSeoHead, DEFAULT_SITE_URL } from "@/lib/seo";
import { loadRuntimeSeoData } from "@/lib/seo.runtime";

export const Route = createFileRoute("/(home)/privacy")({
  loader: () => loadRuntimeSeoData(),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: "Privacy Policy",
      description: "Privacy policy for Visual Dynamics.",
      path: "/privacy",
      index: false,
      siteUrl: loaderData?.siteUrl ?? DEFAULT_SITE_URL,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /(home)/privacy!</div>;
}
