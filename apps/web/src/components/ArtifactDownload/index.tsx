import classes from "./ArtifactDownload.module.css";

import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { artifactDownload } from "@/lib/constants";
import { artifactDownloadQuery } from "@/queries/artifactDownload";

interface Props {
  simulation: Simulation;
  target: ArtifactDownloadTarget;
}

export function ArtifactDownload({ simulation, target }: Props) {
  const { refetch, isLoading } = useQuery(
    artifactDownloadQuery(target, simulation.type),
  );
  const downloadInfo = artifactDownload[target];

  async function handleDownload() {
    const { data } = await refetch();

    if (!data) {
      return;
    }

    let filename = simulation.type;

    if (simulation.type === "acpype") {
      filename += `-${simulation.moleculeName}-${simulation.ligandITPName}-${simulation.ligandPDBName}`;
    } else {
      filename += `-${simulation.moleculeName}`;
    }

    filename += `-${simulation.createdAt}`;

    const link = document.createElement("a");
    link.download = `${filename}-${downloadInfo.file}`;
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
