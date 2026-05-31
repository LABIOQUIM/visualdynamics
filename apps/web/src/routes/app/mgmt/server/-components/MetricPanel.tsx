import { Progress, Text } from "@mantine/core";

import classes from "../server.module.css";

export function MetricPanel({
  detail,
  label,
  progress,
  value,
}: {
  detail: string;
  label: string;
  progress?: number;
  value: string;
}) {
  return (
    <section className={classes.panel}>
      <Text c="dimmed" size="xs" tt="uppercase">
        {label}
      </Text>
      <Text className={classes.metricValue}>{value}</Text>
      <Text c="dimmed" size="xs">
        {detail}
      </Text>
      {typeof progress === "number" ? (
        <Progress
          aria-label={`${label} usage`}
          className={classes.progress}
          color={progress > 85 ? "red" : progress > 70 ? "yellow" : "green"}
          value={progress}
        />
      ) : null}
    </section>
  );
}
