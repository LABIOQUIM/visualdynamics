"use client";
import { Alert, Button, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconPlus,
} from "@tabler/icons-react";

import { Container } from "@/components/Layout/Container";
import { Loader } from "@/components/Loader/Loader";
import { useLatestSimulations } from "@/hooks/simulation/useLatestSimulations";
import { useSettings } from "@/hooks/utils/useSettings";

import { SimulationCard } from "./SimulationCard";

import classes from "./MySimulations.module.css";

export function MySimulations() {
  const { data, isLoading } = useLatestSimulations();
  const { data: settings } = useSettings("visualdynamics");

  // Error or unauthenticated states
  if (settings === "error" || settings === "unauthenticated") {
    return (
      <Container className={classes.containerDownOrMaintenance}>
        <Alert icon={<IconAlertTriangle />} color="red" title="Error">
          Failed to load settings.
        </Alert>
      </Container>
    );
  }

  // System down state
  if (settings?.systemMode === "DOWN") {
    return (
      <Container className={classes.containerDownOrMaintenance}>
        <Alert icon={<IconAlertTriangle />} color="red" title="System Down">
          Visual Dynamics is currently down.
        </Alert>
      </Container>
    );
  }

  // Unauthenticated user
  if (data === "unauthenticated") {
    return (
      <Container className={classes.containerDownOrMaintenance}>
        <Alert
          icon={<IconInfoCircle />}
          color="yellow"
          title="Not Authenticated"
        >
          Please log in to view your simulations.
        </Alert>
      </Container>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Container className={classes.containerDownOrMaintenance}>
        <Loader />
      </Container>
    );
  }

  // No simulations found
  if (!data || Object.keys(data).length === 0) {
    return (
      <Container className={classes.containerDownOrMaintenance}>
        <Stack align="center" gap="md">
          <IconInfoCircle size={32} />
          <Title order={3}>No simulations found</Title>
          <Text c="dimmed">Start a new simulation to see it here.</Text>
          <Button leftSection={<IconPlus size={18} />} variant="light">
            New Simulation
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <SimpleGrid spacing="md" flex={1}>
      <SimulationCard simulation={data.apo} />
      <SimulationCard simulation={data.acpype} />
    </SimpleGrid>
  );
}
