import { Badge, type DefaultMantineColor } from "@mantine/core";

type StatusBadgeProps = {
  status: Simulation["status"];
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors: {
    [key in Simulation["status"]]: DefaultMantineColor;
  } = {
    CANCELED: "dark",
    COMPLETED: "green",
    ERRORED: "red",
    GENERATED: "teal",
    QUEUED: "yellow",
    RUNNING: "blue",
  };

  return (
    <Badge color={colors[status]} fullWidth variant="light">
      {status}
    </Badge>
  );
}
