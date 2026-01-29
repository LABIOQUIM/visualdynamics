import classes from "./ArtifactDownload.module.css";

import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { artifactDownload } from "@/lib/constants";
import { downloadArtifact } from "@/queries/downloadArtifact";

type ArtifactDownloadProps = {
  simulationId: string;
  target: ArtifactDownloadTarget;
};

export function ArtifactDownload({
  simulationId,
  target,
}: ArtifactDownloadProps) {
  const { refetch, isLoading } = useQuery(
    downloadArtifact(target, simulationId),
  );
  const downloadInfo = artifactDownload[target];

  async function handleDownload() {
    const { data } = await refetch();

    if (!data) {
      return;
    }

    const link = document.createElement("a");
    link.download = `${downloadInfo.file}-${simulationId}`;
    const blobUrl = window.URL.createObjectURL(new Blob([data]));

    link.href = blobUrl;
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  }

  return (
    <Button
      classNames={{
        root: classes.root,
        inner: classes.inner,
        label: classes.label,
      }}
      leftSection={<IconDownload />}
      loading={isLoading}
      onClick={handleDownload}
      rightSection={<downloadInfo.Icon className={classes.bg_icon} size={64} />}
    >
      {downloadInfo.label}
    </Button>
  );
}
