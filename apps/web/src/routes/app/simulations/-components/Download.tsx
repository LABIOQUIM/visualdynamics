import classes from "./Download.module.css";

import { Box, Stack } from "@mantine/core";

import { ArtifactDownload } from "./ArtifactDownload";

import { MetricCard } from "@/components/MetricCard";

type DownloadProps = {
  simulationId: string;
};

export function Download({ simulationId }: DownloadProps) {
  const targets = ["commands", "figures", "logs", "results"] as const;

  return (
    <Box className={classes.downloadContainer}>
      {targets.map((target) => (
        <MetricCard.Root key={target}>
          <Stack flex={1} gap="xl" justify="space-between">
            <div style={{ flex: 1 }}>
              <MetricCard.TextEmphasis>teste</MetricCard.TextEmphasis>
              <MetricCard.TextMuted>teste1</MetricCard.TextMuted>
            </div>
            <ArtifactDownload simulationId={simulationId} target={target} />
          </Stack>
        </MetricCard.Root>
      ))}
    </Box>
  );
}
