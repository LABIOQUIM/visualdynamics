import { ActionIcon, Stack, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconEdit,
  IconFolder,
  IconKey,
  IconLock,
  IconLockOff,
  IconX,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import type { MRT_Row } from "mantine-react-table-open";
import type { UserWithRole } from "better-auth/plugins";

import { banUser } from "@/mutations/banUser";
import { forcePasswordReset } from "@/mutations/forcePasswordReset";
import { unbanUser } from "@/mutations/unbanUser";
import { ActionIconLink } from "@/components/RouterComponents";

interface UserRowActionsProps {
  row: MRT_Row<UserWithRole>;
}

export function UserRowActions({ row }: UserRowActionsProps) {
  const queryClient = useQueryClient();

  async function handleBanUser() {
    try {
      await banUser(row.original.id);
      void queryClient.invalidateQueries({ queryKey: ["mgmt-users"] });
      notifications.show({
        message: "User banned successfully",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : "Failed to ban user",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    }
  }

  async function handleUnbanUser() {
    try {
      await unbanUser(row.original.id);
      void queryClient.invalidateQueries({ queryKey: ["mgmt-users"] });
      notifications.show({
        message: "User unbanned successfully",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
    } catch (err) {
      notifications.show({
        message: err instanceof Error ? err.message : "Failed to unban user",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    }
  }

  async function handleForcePasswordReset() {
    try {
      const tempPassword = await forcePasswordReset(row.original.id);
      notifications.show({
        message: `Password reset for ${row.original.username}. Temporary password: ${tempPassword}`,
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
        autoClose: false,
      });
    } catch (err) {
      notifications.show({
        message:
          err instanceof Error ? err.message : "Failed to reset user password",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    }
  }

  return (
    <Stack gap={0}>
      <ActionIcon.Group>
        <Tooltip label="Edit user">
          <ActionIconLink
            params={{ userId: row.original.id }}
            to="/admin/users/$userId"
            size="lg"
            variant="subtle"
          >
            <IconEdit />
          </ActionIconLink>
        </Tooltip>
        {row.original.banned ? (
          <Tooltip label="Unban user">
            <ActionIcon
              color="green"
              onClick={() => {
                void handleUnbanUser();
              }}
              size="lg"
              variant="subtle"
            >
              <IconLockOff />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip label="Ban user">
            <ActionIcon
              color="red"
              onClick={() => {
                void handleBanUser();
              }}
              size="lg"
              variant="subtle"
            >
              <IconLock />
            </ActionIcon>
          </Tooltip>
        )}
        <Tooltip label="Open user folder">
          <ActionIconLink
            params={{ userId: row.original.id }}
            search={{ path: undefined }}
            to="/admin/users/$userId/folder"
            size="lg"
            variant="subtle"
          >
            <IconFolder />
          </ActionIconLink>
        </Tooltip>
        <Tooltip label="Force password reset">
          <ActionIcon
            color="violet"
            onClick={() => {
              void handleForcePasswordReset();
            }}
            size="lg"
            variant="subtle"
          >
            <IconKey />
          </ActionIcon>
        </Tooltip>
      </ActionIcon.Group>
    </Stack>
  );
}
