import { Container, Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

import { LanderLayout } from "./-components/Layout";

import { TERMS_SEO } from "@/lib/seo";

export const Route = createFileRoute("/(home)/terms-of-service")({
  head: () => TERMS_SEO,
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LanderLayout>
      <Container py="xl" size="md">
        <Stack gap="lg">
          <Title order={1}>Terms Of Use In Preparation</Title>
          <Text>
            Formal Visual Dynamics terms of use have not been published yet.
            Access to the platform is currently governed through project and
            administrator guidance.
          </Text>
          <Text>
            For current usage expectations, acceptable use questions, or access
            requests, contact visualdynamics@fiocruz.br.
          </Text>
        </Stack>
      </Container>
    </LanderLayout>
  );
}
