import classes from "./analytics.module.css";

import { AspectRatio } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { LanderCallToActionSection } from "./-components/CallToActionSection";
import { LanderLayout } from "./-components/Layout";

import { Heading } from "@/components/Heading";
import { buildSeoHead, DEFAULT_SITE_URL } from "@/lib/seo";
import { loadRuntimeSeoData } from "@/lib/seo.runtime";

export const Route = createFileRoute("/(home)/analytics")({
  loader: () => loadRuntimeSeoData(),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: "Platform Analytics",
      description:
        "Review public analytics and adoption metrics for the Visual Dynamics molecular dynamics platform.",
      path: "/analytics",
      index: true,
      siteUrl: loaderData?.siteUrl ?? DEFAULT_SITE_URL,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LanderLayout>
      <Heading centered title="Analytics" />
      <AspectRatio className={classes.analyticsContainer} ratio={16 / 9}>
        <iframe
          className={classes.analyticsIframe}
          src="https://lookerstudio.google.com/embed/reporting/c52ec58d-916c-4291-b5db-10f6e9df6e85/page/fhpXD"
          style={{ border: 0 }}
          title="LABIOQUIM Platform Analytics"
        />
      </AspectRatio>
      <LanderCallToActionSection />
    </LanderLayout>
  );
}
