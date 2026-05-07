import classes from "./analytics.module.css";

import { AspectRatio } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { LanderCallToActionSection } from "./-components/CallToActionSection";
import { LanderLayout } from "./-components/Layout";

import { Heading } from "@/components/Heading";
import { ANALYTICS_SEO } from "@/lib/seo";

export const Route = createFileRoute("/(home)/analytics")({
  head: () => ANALYTICS_SEO,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LanderLayout>
      <Heading centered order={1} title="Analytics" />
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
