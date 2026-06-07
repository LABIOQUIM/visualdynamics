import classes from "./Visualizer.module.css";

import { Box, Text } from "@mantine/core";
import { IconCloudOff, IconFolderOff } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { Loader } from "@/components/Loader";
import { LazyMolViewer } from "@/components/LazyMolViewer";
import { getSimulation } from "@/queries/getSimulation";

type VisualizerProps = {
  simulationId: string;
};

export function Visualizer({ simulationId }: VisualizerProps) {
  const { data } = useQuery(getSimulation(simulationId));

  if (!data) {
    return <Loader />;
  }

  if (!data.isStored) {
    return (
      <Box className={classes.noMoleculesContainer}>
        <IconFolderOff size={64} />
        <Text size="lg">
          This simulation is not stored anymore. 3D viewer is unavailable.
        </Text>
      </Box>
    );
  }

  if (data.molecules.macromolecule === null) {
    return (
      <Box className={classes.noMoleculesContainer}>
        <IconCloudOff size={64} />
        <Text size="lg">This simulation has no macromolecule files</Text>
      </Box>
    );
  }

  return (
    <LazyMolViewer
      macromolecules={{
        macromolecule: data.molecules.macromolecule,
        ...(data.molecules.ligands.length > 0
          ? { ligandPdbs: data.molecules.ligands }
          : {}),
      }}
    />
  );
}
