"use client";
import { Box, Code, Text, Title } from "@mantine/core";
import {
  IconAlertTriangle,
  IconClockPause,
  IconExclamationMark,
} from "@tabler/icons-react";

import { Loader } from "@/components/Loader/Loader";
import { useSimulation } from "@/hooks/simulation/useSimulation";
import { useSettings } from "@/hooks/utils/useSettings";

import { RefetchTime } from "./RefetchTime";

import classes from "./Log.module.css";

interface Props {
  simulationId: string;
}

export function Log({ simulationId }: Props) {
  const { data, isError, isLoading } = useSimulation(simulationId);
  const { data: settings } = useSettings("visualdynamics");

  if (settings === "error" || settings === "unauthenticated") {
    return "Failed to load settings";
  }

  if (settings?.systemMode === "MAINTENANCE") {
    return (
      <Box className={classes.containerDownOrMaintenance}>
        <IconAlertTriangle size={48} />
        <Title order={3}>
          Visual Dynamics is currently down for maintenance.
        </Title>
      </Box>
    );
  }

  if (settings?.systemMode === "DOWN") {
    return (
      <Box className={classes.containerDownOrMaintenance}>
        <IconAlertTriangle size={48} />
        <Title order={3}>Visual Dynamics is currently down.</Title>
      </Box>
    );
  }

  if (!data || isLoading) {
    return (
      <Box className={classes.container_loading}>
        <RefetchTime simulationId={simulationId} />
        <Loader />
      </Box>
    );
  }

  if (data === "unauthenticated" || isError) {
    return (
      <Box className={classes.container_loading}>
        <IconAlertTriangle size={64} />
        <Title order={3}>Something went wrong.</Title>
        <RefetchTime simulationId={simulationId} />
      </Box>
    );
  }

  if (data.status === "not-running") {
    return (
      <Box className={classes.not_running_container}>
        <IconExclamationMark size={64} />
        <Title order={3}>You have no simulation running.</Title>
        <RefetchTime simulationId={simulationId} />
      </Box>
    );
  }

  if (data.status === "queued") {
    return (
      <Box className={classes.not_running_container}>
        <IconClockPause size={64} />
        <Title order={3}>
          Your simulation is the #{data.position} in queue.
        </Title>
        <small>
          Do not worry, our workers will pick up your simulation automatically
          when it becomes available.
        </small>
        <RefetchTime simulationId={simulationId} />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.container_title}>
        <Title order={3}>Logs</Title>
        <RefetchTime simulationId={simulationId} />
      </Box>
      <Code block className={classes.logContainer}>
        {data.logData.map((line, idx) => (
          <Text key={line + idx}>{line}</Text>
        ))}
      </Code>
    </Box>
  );
}
