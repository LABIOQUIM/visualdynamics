import classes from "./MySimulations.module.css";

import { Box } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { SimulationCard } from "../SimulationCard";

import { latestSimulationsQuery } from "@/queries/latestSimulations";

export function MySimulations() {
  const { data, isLoading } = useQuery(latestSimulationsQuery);

  if (isLoading) {
    return (
      <Box className={classes.container}>
        <SimulationCard isLoading={isLoading} simulation={null} type="apo" />
        <SimulationCard isLoading={isLoading} simulation={null} type="acpype" />
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <SimulationCard simulation={data?.apo || null} type="apo" />
      <SimulationCard simulation={data?.acpype || null} type="acpype" />
    </Box>
  );
}
