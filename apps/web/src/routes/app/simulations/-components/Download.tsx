import classes from "./Download.module.css";

import { Box, Stack, Text } from "@mantine/core";
import { IconFolderOff } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { ArtifactDownload } from "@/components/ArtifactDownload";
import { Loader } from "@/components/Loader";
import { MetricCard } from "@/components/MetricCard";
import { getSimulation } from "@/queries/getSimulation";

type DownloadProps = {
  simulationId: string;
};

const targets = [
  {
    key: "commands",
    label: "Commands and MDP Files",
    description: "The commands and files needed to reproduce your simulation",
  },
  {
    key: "figures",
    label: "Figures",
    description:
      "A visual representation of data and results, including plots and graphs generated from your simulation",
  },
  {
    key: "logs",
    label: "GROMACS Log",
    description:
      "A collection of log files detailing the operations and outputs of GROMACS commands that were executed in your simulation",
  },
  {
    key: "results",
    label: "Raw Results",
    description:
      "Unprocessed output data obtained directly from the simulation, ready for further analysis",
  },
] as const;

export function Download({ simulationId }: DownloadProps) {
  const { data } = useQuery(getSimulation(simulationId));

  if (!data) {
    return <Loader />;
  }

  if (!data.isStored) {
    return (
      <Box className={classes.noDownloadContainer}>
        <IconFolderOff size={64} />
        <Text size="lg">
          This simulation is not stored anymore. Downloads are unavailable.
        </Text>
      </Box>
    );
  }

  return (
    <Box className={classes.downloadContainer}>
      {targets.map((target) => (
        <MetricCard.Root key={target.key}>
          <Stack flex={1} gap="xl" justify="space-between">
            <Stack style={{ flex: 1 }}>
              <MetricCard.TextEmphasis>{target.label}</MetricCard.TextEmphasis>
              <MetricCard.TextMuted>{target.description}</MetricCard.TextMuted>
            </Stack>
            <Stack>
              {target.key === "commands" && (
                <ArtifactDownload simulationId={simulationId} target="mdp" />
              )}
              <ArtifactDownload
                disabled={
                  target.key !== "commands"
                    ? !["COMPLETED"].includes(data.simulation.status)
                    : false
                }
                simulationId={simulationId}
                target={target.key}
              />
            </Stack>
          </Stack>
        </MetricCard.Root>
      ))}
    </Box>
  );
}
