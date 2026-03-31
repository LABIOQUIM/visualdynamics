import classes from "./ArtifactDownload.module.css";

import { useState } from "react";
import { Button, Progress, Stack } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

import { artifactDownload } from "@/lib/constants";
import { fetchArtifact } from "@/queries/downloadArtifact";

type ArtifactDownloadProps = {
  simulationId: string;
  target: ArtifactDownloadTarget;
  disabled?: boolean;
};

export function ArtifactDownload({
  disabled,
  simulationId,
  target,
}: ArtifactDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const downloadInfo = artifactDownload[target];

  async function handleDownload() {
    setIsLoading(true);
    setProgress(0);
    try {
      const blob = await fetchArtifact(target, simulationId, setProgress);

      const filename = downloadInfo.file.split(".");
      const link = document.createElement("a");
      link.download = `${filename[0]}-${simulationId}.${filename[1]}`;
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }

  return (
    <Stack gap={4}>
      <Button
        classNames={{
          root: classes.root,
          inner: classes.inner,
          label: classes.label,
        }}
        disabled={disabled || isLoading}
        leftSection={<IconDownload />}
        loading={isLoading}
        onClick={handleDownload}
        rightSection={
          <downloadInfo.Icon className={classes.bg_icon} size={64} />
        }
      >
        {downloadInfo.label}
      </Button>
      {isLoading && progress > 0 && (
        <Progress animated size="xs" value={progress} />
      )}
    </Stack>
  );
}
