import classes from "./ExecutionProgress.module.css";

import { Box, Loader, Text } from "@mantine/core";
import { IconCloudOff } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { Log } from "./Log";
import { RefetchTime } from "./RefetchTime";
import { Steps } from "./Steps";

import { getSimulation } from "@/queries/getSimulation";

type ExecutionProgressProps = {
  simulationId: string;
};

export function ExecutionProgress({ simulationId }: ExecutionProgressProps) {
  const { data } = useQuery(getSimulation(simulationId));

  if (!data) {
    return <Loader />;
  }

  if (data.simulation.status === "GENERATED") {
    return (
      <Box className={classes.noLogsContainer}>
        <IconCloudOff size={64} />
        <Text size="lg">This simulation has no execution logs</Text>
      </Box>
    );
  }

  if (data.isRunning && data.queue !== -1) {
    return (
      <Box className={classes.noLogsContainer}>
        <Loader />
        <Text size="lg">
          Your simulation is in the queue (position: {data.queue})
        </Text>
        <RefetchTime />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Steps isSimulationRunning={data.isRunning} stepsDone={data.stepData} />
      <Log logs={data.logData} />
    </Box>
  );
}
