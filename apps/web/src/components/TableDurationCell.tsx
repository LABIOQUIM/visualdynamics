import type { Duration } from "dayjs/plugin/duration";
import type { MRT_Cell } from "mantine-react-table-open";

export function TableDurationCell({ cell }: { cell: MRT_Cell<any> }) {
  const duration = cell.getValue<Duration | string>();

  if (typeof duration === "string") {
    return duration;
  }

  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return `${hours}h ${minutes}m ${seconds}s`;
}
