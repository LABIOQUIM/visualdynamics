import classes from "./SimulationDetails.module.css";

import { Button, Card, Stack, Text, Title } from "@mantine/core";
import { IconCircleOff, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useQueryState } from "nuqs";

import { SimulationTabs } from "../SimulationTabs/SimulationTabs";

import { Loader } from "@/components/Loader";
import { nuqsKeys } from "@/lib/constants";
import { dateFormat } from "@/lib/utils";
import { latestSimulationsQuery } from "@/queries/latestSimulations";

export function SimulationDetails() {
  const [expanded] = useQueryState<"apo" | "acpype" | null>(
    nuqsKeys.SIMULATION_EXPANDED_DETAILS,
    {
      defaultValue: null,
      parse(value) {
        return value as "apo" | "acpype" | null;
      },
    },
  );
  const { data, isLoading } = useQuery(latestSimulationsQuery);

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

  // No simulations found
  if (!data || Object.keys(data).length === 0 || !data[expanded]) {
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

  const simulation = data[expanded];

  return (
    <Card className={classes.container} withBorder>
      <div className={classes.headingContainer}>
        <div>
          <Text>
            <strong>Type</strong>: {simulation.type.toUpperCase()}
          </Text>
          <Text>
            <strong>Macromolecule</strong>: {simulation.moleculeName}
          </Text>
          <Text>
            <strong>Ligand (ITP)</strong>: {simulation.ligandITPName ?? "N/A"}
          </Text>
          <Text>
            <strong>Ligand (PDB)</strong>: {simulation.ligandPDBName ?? "N/A"}
          </Text>
        </div>
        <div>
          <Text>
            <strong>Submitted At</strong>: {dateFormat(simulation.createdAt)}
          </Text>
          <Text>
            <strong>Started At</strong>:{" "}
            {simulation.startedAt
              ? dateFormat(simulation.startedAt)
              : "Not Started Yet"}
          </Text>
          <Text>
            <strong>Ended At</strong>:{" "}
            {simulation.endedAt
              ? dateFormat(simulation.endedAt)
              : "Not Ended Yet"}
          </Text>
        </div>
      </div>
      <SimulationTabs />
    </Card>
  );
}
