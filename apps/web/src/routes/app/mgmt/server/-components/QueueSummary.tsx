import { Badge, Group, Text, Title } from "@mantine/core";

import classes from "./QueueSummary.module.css";

const queueCountKeys = ["waiting", "active", "completed", "failed"] as const;

function QueueStateBadge({ paused }: { paused: boolean }) {
  return (
    <Badge color={paused ? "red" : "green"} variant="light">
      {paused ? "Paused" : "Running"}
    </Badge>
  );
}

function getQueueCount(data: SimulationQueueDiagnostics | undefined, key: string) {
  return data?.counts[key] ?? 0;
}

function getTotalTrackedJobs(data: SimulationQueueDiagnostics | undefined) {
  return queueCountKeys.reduce((total, key) => total + getQueueCount(data, key), 0);
}

function QueueCountItem({
  label,
  value,
}: {
  label: (typeof queueCountKeys)[number];
  value: number;
}) {
  return (
    <div className={classes.countItem}>
      <Text c="dimmed" className={classes.countLabel} size="xs" tt="uppercase">
        {label}
      </Text>
      <Text className={classes.countValue}>{value}</Text>
    </div>
  );
}

export function QueueSummary({
  queueData,
}: {
  queueData?: SimulationQueueDiagnostics | undefined;
}) {
  const workerCount = queueData?.workerCount;
  const totalTrackedJobs = getTotalTrackedJobs(queueData);

  return (
    <section className={classes.queueSummary}>
      <Group className={classes.header} justify="space-between">
        <Title order={4}>Simulation Queue</Title>
        {queueData ? <QueueStateBadge paused={queueData.paused} /> : null}
      </Group>

      <div className={classes.queueGrid}>
        <div className={classes.workerPanel}>
          <div>
            <Text c="dimmed" size="xs" tt="uppercase">
              Workers
            </Text>
            <Text className={classes.workerValue}>{workerCount ?? "--"}</Text>
          </div>
          <div className={classes.workerDetails}>
            <Text size="sm">
              {workerCount === undefined
                ? "Waiting for BullMQ diagnostics"
                : `${workerCount} registered Redis worker${workerCount === 1 ? "" : "s"}`}
            </Text>
            <Text c="dimmed" size="sm">
              {totalTrackedJobs} tracked job{totalTrackedJobs === 1 ? "" : "s"} across visible
              states
            </Text>
          </div>
        </div>

        {queueCountKeys.map((key) => (
          <QueueCountItem key={key} label={key} value={getQueueCount(queueData, key)} />
        ))}
      </div>
    </section>
  );
}
