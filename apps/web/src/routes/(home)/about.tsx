import { createFileRoute } from "@tanstack/react-router";

import { buildSeoHead, DEFAULT_SITE_URL } from "@/lib/seo";
import { loadRuntimeSeoData } from "@/lib/seo.runtime";

export const Route = createFileRoute("/(home)/about")({
  loader: () => loadRuntimeSeoData(),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: "About",
      description: "About Visual Dynamics.",
      path: "/about",
      index: false,
      siteUrl: loaderData?.siteUrl ?? DEFAULT_SITE_URL,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /(home)/about!</div>;
}
