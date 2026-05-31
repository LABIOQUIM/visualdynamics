import classes from "./ArtifactDownload.module.css";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Loader } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

import { artifactDownload } from "@/lib/constants";
import {
  completeDownload,
  failDownload,
  startDownload,
  updateProgress,
} from "@/lib/downloads";
import { useDownloads } from "@/hooks/useDownloads";
import { fetchArtifact } from "@/queries/downloadArtifact";

type ArtifactDownloadProps = {
  simulationId: string;
  target: ArtifactDownloadTarget;
  disabled?: boolean;
};

function fmt(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const v = bytes / 1024 ** i;
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

export function ArtifactDownload({
  disabled,
  simulationId,
  target,
}: ArtifactDownloadProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const downloadInfo = artifactDownload[target];
  const [activeId, setActiveId] = useState<string | null>(null);

  const downloads = useDownloads();
  const entry = activeId ? downloads.find((d) => d.id === activeId) : undefined;
  const isLoading = entry?.status === "active";
  const progress = entry?.progress ?? {
    loaded: 0,
    total: 0,
    percent: 0,
  };

  async function handleDownload() {
    const id = `${target}-${simulationId}-${Date.now()}`;
    setActiveId(id);
    startDownload(
      id,
      downloadInfo.label,
      downloadInfo.file,
      target,
      simulationId,
    );
    try {
      const blob = await fetchArtifact(target, simulationId, (p) => {
        updateProgress(id, p);
      });

      const filename = downloadInfo.file.split(".");
      const link = document.createElement("a");
      link.download = `${filename[0]}-${simulationId}.${filename[1]}`;
      const blobUrl = window.URL.createObjectURL(blob);
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

      completeDownload(id);
    } catch {
      failDownload(id);
    } finally {
      setActiveId(null);
    }
  }

  const progressLabel =
    progress.total > 0
      ? `${fmt(progress.loaded)} / ${fmt(progress.total)}`
      : `${progress.percent}%`;

  return (
    <Button
      classNames={{
        root: classes.root,
        inner: classes.inner,
        label: classes.label,
      }}
      disabled={disabled ?? isLoading}
      {...(!isLoading ? { leftSection: <IconDownload /> } : {})}
      onClick={handleDownload}
      ref={rootRef}
      rightSection={<downloadInfo.Icon className={classes.bg_icon} size={64} />}
      style={{ "--fill-width": `${progress.percent}%` } as React.CSSProperties}
      variant={isLoading ? "outline" : "filled"}
    >
      {!isLoading && downloadInfo.label}
      {isLoading &&
        rootRef.current &&
        createPortal(
          <>
            <span className={classes.primaryLayer}>
              <Loader size="sm" />
              {downloadInfo.label} ({progressLabel})
            </span>
            <span className={classes.whiteLayer}>
              <Loader color="white" size="sm" />
              {downloadInfo.label} ({progressLabel})
            </span>
          </>,
          rootRef.current,
        )}
    </Button>
  );
}
