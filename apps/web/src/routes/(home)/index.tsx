import { createFileRoute } from "@tanstack/react-router";

import { LanderBackingSection } from "./-components/BackingSection";
import { LanderCallToActionSection } from "./-components/CallToActionSection";
import { LanderFeaturesSection } from "./-components/FeaturesSection";
import { LanderHeroSection } from "./-components/HeroSection";
import { LanderLayout } from "./-components/Layout";

export const Route = createFileRoute("/(home)/")({
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
