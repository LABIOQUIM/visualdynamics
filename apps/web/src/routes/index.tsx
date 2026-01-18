import { createFileRoute } from "@tanstack/react-router";

import { LanderBackingSection } from "@/components/Lander/BackingSection";
import { LanderCallToActionSection } from "@/components/Lander/CallToActionSection";
import { LanderFeaturesSection } from "@/components/Lander/FeaturesSection";
import { LanderHeroSection } from "@/components/Lander/HeroSection";
import { LanderLayout } from "@/components/Lander/Layout";

export const Route = createFileRoute("/")({
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
