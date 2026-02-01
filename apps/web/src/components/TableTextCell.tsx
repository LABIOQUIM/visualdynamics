import type { MRT_Cell } from "mantine-react-table-open";

export function TableTextCell({ cell }: { cell: MRT_Cell<any> }) {
  const originalValue = cell.getValue<string | undefined>();

  if (!originalValue) {
    return "—";
  }

  return originalValue;
}
