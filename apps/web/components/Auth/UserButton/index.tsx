import { ActionIcon, Avatar, Box, Group, Text } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { User } from "lucia";

import { invalidateSession } from "@/hooks/invalidateSession";

import classes from "./UserButton.module.css";

interface Props {
  user: User;
}

export function UserButton({ user }: Props) {
  const userFullName = `${user.firstName} ${user.lastName}`;

  return (
    <Box className={classes.user}>
      <Group>
        <Avatar radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {userFullName.trim()}
          </Text>

          <Text c="dimmed" size="xs">
            {user.email}
          </Text>
        </div>

        <ActionIcon
          color="red"
          onClick={() => invalidateSession()}
          size="lg"
          variant="light"
        >
          <IconLogout size={18} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
