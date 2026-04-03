import dayjs from "dayjs";
import type { MRT_Cell } from "mantine-react-table-open";

export function TableDateCell({ cell }: { cell: MRT_Cell<any> }) {
  const originalValue = cell.getValue<string | undefined>();

  if (!originalValue) {
    return "—";
  }

  const date = dayjs(originalValue);

  if (!date.isValid()) {
    return "—";
  }

  return date.format("YYYY-MM-DD HH:mm:ss");
}
