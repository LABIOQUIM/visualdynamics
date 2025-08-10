"use client";
import { Alert, Button, Card, Stack, Text, Title } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCircleOff,
  IconInfoCircle,
  IconPlus,
} from "@tabler/icons-react";
import clsx from "clsx";
import { useQueryState } from "nuqs";

import { QueryParams } from "@/app/_constants/queries";
import { Loader } from "@/components/Loader/Loader";
import { useLatestSimulations } from "@/hooks/simulation/useLatestSimulations";
import { useSettings } from "@/hooks/utils/useSettings";

import classes from "./SimulationDetails.module.css";

export function SimulationDetails() {
  const [expanded] = useQueryState(QueryParams.SIMULATION_EXPANDED_DETAILS);
  const { data, isLoading } = useLatestSimulations();
  const { data: settings } = useSettings("visualdynamics");

  // Error or unauthenticated states
  if (settings === "error" || settings === "unauthenticated") {
    return (
      <Card
        className={clsx(classes.container, classes.noSelectionContainer)}
        withBorder
      >
        <Alert icon={<IconAlertTriangle />} color="red" title="Error">
          Failed to load settings.
        </Alert>
      </Card>
    );
  }

  // System down state
  if (settings?.systemMode === "DOWN") {
    return (
      <Card
        className={clsx(classes.container, classes.noSelectionContainer)}
        withBorder
      >
        <Alert icon={<IconAlertTriangle />} color="red" title="System Down">
          Visual Dynamics is currently down.
        </Alert>
      </Card>
    );
  }

  // Unauthenticated user
  if (data === "unauthenticated") {
    return (
      <Card
        className={clsx(classes.container, classes.noSelectionContainer)}
        withBorder
      >
        <Alert
          icon={<IconInfoCircle />}
          color="yellow"
          title="Not Authenticated"
        >
          Please log in to view your simulations.
        </Alert>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card
        className={clsx(classes.container, classes.noSelectionContainer)}
        withBorder
      >
        <Loader />
      </Card>
    );
  }

  // No simulations found
  if (!data || Object.keys(data).length === 0) {
    return (
      <Card
        className={clsx(classes.container, classes.noSelectionContainer)}
        withBorder
      >
        <Stack align="center" gap="md">
          <IconInfoCircle size={32} />
          <Title order={3}>No simulations found</Title>
          <Text c="dimmed">Start a new simulation to see it here.</Text>
          <Button leftSection={<IconPlus size={18} />} variant="light">
            New Simulation
          </Button>
        </Stack>
      </Card>
    );
  }

  if (!expanded) {
    return (
      <Card
        className={clsx(classes.container, classes.noSelectionContainer)}
        withBorder
      >
        <IconCircleOff size={96} />
        <Text fw={600} size="lg">
          No Simulation Selected
        </Text>
      </Card>
    );
  }

  return (
    <Card className={classes.container} withBorder>
      expanded
    </Card>
  );
}
