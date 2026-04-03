import classes from "./StatusBadge.module.css";

const labels: Record<Simulation["status"], string> = {
  CANCELED: "Canceled",
  COMPLETED: "Completed",
  ERRORED: "Errored",
  GENERATED: "Generated",
  QUEUED: "Queued",
  RUNNING: "Running",
};

type StatusBadgeProps = {
  status: Simulation["status"];
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${classes.badge} ${classes[status]}`}>
      {labels[status]}
    </span>
  );
}
