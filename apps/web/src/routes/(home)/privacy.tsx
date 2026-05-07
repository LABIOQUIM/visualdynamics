import { Container, Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { LanderLayout } from "./-components/Layout";

import { PRIVACY_SEO } from "@/lib/seo";

export const Route = createFileRoute("/(home)/privacy")({
  head: () => PRIVACY_SEO,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LanderLayout>
      <Container py="xl" size="md">
        <Stack gap="lg">
          <Title order={1}>Privacy Notice In Preparation</Title>
          <Text>
            A full Visual Dynamics privacy notice has not been published yet.
            This page exists so visitors can find the correct support channel
            while the formal policy is being prepared.
          </Text>
          <Text>
            For current questions about account data, uploaded files, or
            research workflow handling, contact the maintainers at
            visualdynamics@fiocruz.br.
          </Text>
        </Stack>
      </Container>
    </LanderLayout>
  );
}
