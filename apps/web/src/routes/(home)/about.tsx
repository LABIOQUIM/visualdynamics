import { Anchor, Container, Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { LanderLayout } from "./-components/Layout";

import { ABOUT_SEO } from "@/lib/seo";

export const Route = createFileRoute("/(home)/about")({
  head: () => ABOUT_SEO,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LanderLayout>
      <Container py="xl" size="md">
        <Stack gap="lg">
          <Title order={1}>About Visual Dynamics</Title>
          <Text>
            Visual Dynamics is a web platform for molecular dynamics workflows,
            interactive trajectory visualization, and simulation analysis. It
            is designed to reduce the friction between preparing simulations,
            executing them, and reviewing results in one interface.
          </Text>
          <Text>
            The platform is maintained within the LABIOQUIM ecosystem and
            supports research teams that need accessible, browser-based tools
            for simulation-driven work.
          </Text>
          <Text>
            For project updates, issues, or support, visit the{" "}
            <Anchor
              href="https://github.com/LABIOQUIM/visualdynamics"
              rel="noopener noreferrer"
              target="_blank"
            >
              Visual Dynamics repository
            </Anchor>
            .
          </Text>
        </Stack>
      </Container>
    </LanderLayout>
  );
}
