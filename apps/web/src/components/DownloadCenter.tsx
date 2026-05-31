import classes from "./DownloadCenter.module.css";

import {
  ActionIcon,
  Badge,
  Button,
  Popover,
  Progress,
  Text,
} from "@mantine/core";
import {
  IconCheck,
  IconCloudDownload,
  IconDownload,
  IconExclamationCircle,
  IconFile,
  IconX,
} from "@tabler/icons-react";

import { useDownloads } from "@/hooks/useDownloads";
import {
  clearCompleted,
  removeDownload,
  type DownloadEntry,
} from "@/lib/downloads";

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

function formatSpeed(bytesPerSec: number): string {
  return `${fmt(bytesPerSec)}/s`;
}

function formatETA(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "";
  if (seconds < 60) return `${Math.round(seconds)}s left`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m left`;
  return `${Math.round(seconds / 3600)}h left`;
}

function getSpeed(entry: DownloadEntry): { speed: number; eta: number } {
  const elapsed = (Date.now() - entry.startedAt) / 1000;
  const speed = elapsed > 0.5 ? entry.progress.loaded / elapsed : 0;
  const remaining = entry.progress.total - entry.progress.loaded;
  const eta = speed > 0 && remaining > 0 ? remaining / speed : 0;
  return { speed, eta };
}

function DownloadRow({ entry }: { entry: DownloadEntry }) {
  const active = entry.status === "active";
  const complete = entry.status === "complete";
  const error = entry.status === "error";
  const p = entry.progress;
  const { speed, eta } = getSpeed(entry);

  const iconClass = active
    ? classes.iconActive
    : complete
      ? classes.iconComplete
      : classes.iconError;

  const IconComponent = active
    ? IconCloudDownload
    : complete
      ? IconCheck
      : IconExclamationCircle;

  return (
    <div className={classes.row}>
      <div className={classes.rowTop}>
        <div className={`${classes.rowIcon} ${iconClass}`}>
          <IconComponent size={18} stroke={1.5} />
        </div>

        <div className={classes.rowInfo}>
          <Text className={classes.fileName}>{entry.fileName}</Text>
          <Text className={classes.fileType}>{entry.fileType}</Text>

          {active && (
            <>
              <Progress
                animated
                className={classes.progressBar}
                size="sm"
                value={p.percent}
              />
              <div className={classes.progressStats}>
                <span>
                  {p.total > 0
                    ? `${fmt(p.loaded)} / ${fmt(p.total)}`
                    : `${p.percent}%`}
                </span>
                <span className={classes.progressSpeed}>
                  {speed > 0 && formatSpeed(speed)}
                  {speed > 0 && eta > 0 && ` — ${formatETA(eta)}`}
                </span>
              </div>
            </>
          )}

          {complete && (
            <Text className={`${classes.statusBadge} ${classes.completeBadge}`}>
              Complete — {fmt(p.loaded)}
            </Text>
          )}

          {error && (
            <Text className={`${classes.statusBadge} ${classes.errorBadge}`}>
              Download failed
            </Text>
          )}

          <Text className={classes.simLabel}>
            Simulation {entry.simulationLabel}
          </Text>
        </div>

        <ActionIcon
          className={classes.dismissBtn}
          color="gray"
          onClick={() => removeDownload(entry.id)}
          size="sm"
          variant="subtle"
        >
          <IconX size={14} />
        </ActionIcon>
      </div>
    </div>
  );
}

export function DownloadCenter() {
  const downloads = useDownloads();
  const activeCount = downloads.filter((d) => d.status === "active").length;
  const hasCompleted = downloads.some((d) => d.status !== "active");

  return (
    <Popover keepMounted position="bottom-end" shadow="md">
      <Popover.Target>
        <ActionIcon
          className={classes.trigger}
          color="gray"
          pos="relative"
          size="lg"
          variant="subtle"
        >
          <IconDownload size={18} />
          {activeCount > 0 && (
            <Badge
              circle
              className={classes.badge}
              color="blue"
              size="xs"
              variant="filled"
            >
              {activeCount}
            </Badge>
          )}
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown className={classes.panel}>
        <div className={classes.header}>
          <Text className={classes.headerTitle}>
            Downloads{activeCount > 0 ? ` (${activeCount} active)` : ""}
          </Text>
          {hasCompleted && (
            <Button
              className={classes.clearBtn}
              color="gray"
              onClick={clearCompleted}
              size="compact-xs"
              variant="subtle"
            >
              Clear completed
            </Button>
          )}
        </div>

        <div className={classes.body}>
          {downloads.length === 0 ? (
            <div className={classes.empty}>
              <IconFile className={classes.emptyIcon} size={32} stroke={1} />
              <Text className={classes.emptyText}>
                No downloads yet. Files will appear here when you start a
                download.
              </Text>
            </div>
          ) : (
            downloads.map((d) => <DownloadRow entry={d} key={d.id} />)
          )}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
