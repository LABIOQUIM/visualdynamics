import classes from "./Download.module.css";

import { Box, Stack } from "@mantine/core";

import { ArtifactDownload } from "@/components/ArtifactDownload";
import { MetricCard } from "@/components/MetricCard";

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
