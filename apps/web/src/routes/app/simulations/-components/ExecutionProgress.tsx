import classes from "./ExecutionProgress.module.css";

import { Box, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { Log } from "./Log";
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

  return (
    <Box className={classes.container}>
      <Steps isSimulationRunning={data.isRunning} stepsDone={data.stepData} />
      <Log logs={data.logData} />
    </Box>
  );
}
