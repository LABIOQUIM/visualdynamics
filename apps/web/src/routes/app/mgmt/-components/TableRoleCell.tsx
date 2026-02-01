import { Badge } from "@mantine/core";
import { IconCrown, IconUser, type ReactNode } from "@tabler/icons-react";
import type { UserWithRole } from "better-auth/plugins";
import type { MRT_Cell } from "mantine-react-table-open";

const roleColors: { [key: string]: string } = {
  admin: "yellow",
  user: "blue",
};

const roleIcons: { [key: string]: ReactNode } = {
  admin: <IconCrown size={14} />,
  user: <IconUser size={14} />,
};

export function TableRoleCell({ cell }: { cell: MRT_Cell<UserWithRole> }) {
  const role = cell.getValue<UserWithRole["role"]>();

  if (!role) {
    return "—";
  }

  return (
    <Badge
      color={roleColors[role]}
      leftSection={roleIcons[role]}
      variant="light"
    >
      {role}
    </Badge>
  );
}
