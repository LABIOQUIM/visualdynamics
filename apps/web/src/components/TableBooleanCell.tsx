import { Flex } from "@mantine/core";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";
import type { MRT_Cell } from "mantine-react-table-open";

export function TableBooleanCell({ cell }: { cell: MRT_Cell<any> }) {
  const originalValue = cell.getValue<boolean | undefined>();

  let Icon = (
    <IconCircleCheckFilled style={{ color: "var(--mantine-color-green-6)" }} />
  );

  if (!originalValue) {
    Icon = (
      <IconCircleXFilled style={{ color: "var(--mantine-color-red-6)" }} />
    );
  }

  return (
    <Flex align="center" gap="calc(var(--mantine-spacing-xs) / 3)">
      {Icon}
      {originalValue ? "Yes" : "No"}
    </Flex>
  );
}
