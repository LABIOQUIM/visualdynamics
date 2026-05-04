import classes from "./ArtifactDownload.module.css";

import { useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { Button, Loader } from "@mantine/core";
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
  const rootRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const downloadInfo = artifactDownload[target];

  async function handleDownload() {
    setIsLoading(true);
    setProgress(0);
    try {
      const blob = await fetchArtifact(target, simulationId, (p) => {
        flushSync(() => setProgress(p));
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
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  }

  return (
    <Button
      classNames={{
        root: classes.root,
        inner: classes.inner,
        label: classes.label,
      }}
      {...(disabled !== undefined ? { disabled } : {})}
      {...(!isLoading ? { leftSection: <IconDownload /> } : {})}
      onClick={handleDownload}
      ref={rootRef}
      rightSection={<downloadInfo.Icon className={classes.bg_icon} size={64} />}
      style={{ "--fill-width": `${progress}%` } as React.CSSProperties}
      variant={isLoading ? "outline" : "filled"}
    >
      {!isLoading && downloadInfo.label}
      {isLoading &&
        rootRef.current &&
        createPortal(
          <>
            <span className={classes.primaryLayer}>
              <Loader size="sm" />
              {downloadInfo.label}
            </span>
            <span className={classes.whiteLayer}>
              <Loader color="white" size="sm" />
              {downloadInfo.label}
            </span>
          </>,
          rootRef.current,
        )}
    </Button>
  );
}
