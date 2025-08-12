"use client";
import { useEffect, useRef } from "react";
import { Alert, Button, Card, Stack, Text, Title } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCircleOff,
  IconInfoCircle,
  IconPlus,
} from "@tabler/icons-react";
import Viewer from "3dmol";
import clsx from "clsx";
import { useQueryState } from "nuqs";

import { QueryParams } from "@/app/_constants/queries";
import { Loader } from "@/components/Loader/Loader";
import { useLatestSimulationMacromolecules } from "@/hooks/simulation/useLatestSimulationMacromolecules";
import { useLatestSimulations } from "@/hooks/simulation/useLatestSimulations";
import { useSettings } from "@/hooks/utils/useSettings";
import { dateFormat } from "@/utils/dateFormat";

import classes from "./SimulationDetails.module.css";

export function SimulationDetails() {
  const [expanded] = useQueryState<"apo" | "acpype" | null>(
    QueryParams.SIMULATION_EXPANDED_DETAILS,
    {
      defaultValue: null,
      parse(value) {
        return value as "apo" | "acpype" | null;
      },
    }
  );
  const { data, isLoading } = useLatestSimulations();
  const { data: settings } = useSettings("visualdynamics");
  const { data: macromolecules } = useLatestSimulationMacromolecules(expanded);

  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !viewerRef.current ||
      !expanded ||
      !macromolecules ||
      macromolecules === "unauthenticated"
    ) {
      return;
    }

    const viewer = Viewer.createViewer(viewerRef.current, {
      backgroundColor: "#f8f9fa",
    });

    // Load the macromolecule structure
    const macromolecule = macromolecules.macromolecule;
    const ligandPdb = macromolecules.ligandPdb;

    if (macromolecule) {
      viewer.addModel(macromolecule, "pdb", {
        style: { cartoon: { color: "spectrum" } },
      });
    }

    if (ligandPdb) {
      viewer.addModel(ligandPdb, "pdb", {
        style: { stick: {} },
      });
    }

    viewer.zoomTo();
    viewer.render();

    return () => {
      viewer.removeAllModels();
      viewer.clear();
    };
  }, [expanded, macromolecules]);

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
          <Text className={classes.contentText}>
            <strong>Type</strong>: {simulation.type.toUpperCase()}
          </Text>
          <Text className={classes.contentText}>
            <strong>Macromolecule</strong>: {simulation.moleculeName}
          </Text>
          <Text className={classes.contentText}>
            <strong>Ligand (ITP)</strong>: {simulation.ligandITPName ?? "N/A"}
          </Text>
          <Text className={classes.contentText}>
            <strong>Ligand (PDB)</strong>: {simulation.ligandPDBName ?? "N/A"}
          </Text>
        </div>
        <div>
          <Text className={classes.contentText}>
            <strong>Submitted At</strong>: {dateFormat(simulation.createdAt)}
          </Text>
          <Text className={classes.contentText}>
            <strong>Started At</strong>:{" "}
            {simulation.startedAt
              ? dateFormat(simulation.startedAt)
              : "Not Started Yet"}
          </Text>
          <Text className={classes.contentText}>
            <strong>Ended At</strong>:{" "}
            {simulation.endedAt
              ? dateFormat(simulation.endedAt)
              : "Not Ended Yet"}
          </Text>
        </div>
      </div>
      <div className={classes.viewerContainer} ref={viewerRef} />
    </Card>
  );
}
