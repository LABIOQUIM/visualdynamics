import { createFileRoute } from "@tanstack/react-router";

import { LanderBackingSection } from "./-components/BackingSection";
import { LanderCallToActionSection } from "./-components/CallToActionSection";
import { LanderFeaturesSection } from "./-components/FeaturesSection";
import { LanderHeroSection } from "./-components/HeroSection";
import { LanderLayout } from "./-components/Layout";

import { buildSeoHead, DEFAULT_SITE_URL } from "@/lib/seo";
import { loadRuntimeSeoData } from "@/lib/seo.runtime";

export const Route = createFileRoute("/(home)/")({
  loader: () => loadRuntimeSeoData(),
  head: ({ loaderData }) =>
    buildSeoHead({
      title: "Molecular Dynamics Analysis Platform",
      description:
        "Explore molecular dynamics trajectories, analysis tools, and browser-based 3D visualization with Visual Dynamics.",
      path: "/",
      index: true,
      siteUrl: loaderData?.siteUrl ?? DEFAULT_SITE_URL,
    }),
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <LanderLayout>
      <LanderHeroSection />
      <LanderFeaturesSection />
      {/* <LanderDemoSection /> */}
      <LanderBackingSection />
      <LanderCallToActionSection />
      {/* Add other sections as needed */}
    </LanderLayout>
  );
}
