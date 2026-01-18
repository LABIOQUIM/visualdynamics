import classes from "./User.module.css";

import { useCallback } from "react";
import { ActionIcon, Avatar, Box, Group, Text } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";

export function User() {
  const { data } = authClient.useSession();

  const onLogout = useCallback(() => {
    authClient.signOut();
  }, []);

  if (!data || !data.session || !data.user) {
    return null;
  }

  return (
    <Box className={classes.user}>
      <Group>
        <Avatar radius="xl" />

        <Box style={{ flex: 1 }}>
          <Text fw={500} lineClamp={1} size="sm">
            {data.user.name}
          </Text>

          <Text c="dimmed" lineClamp={1} size="xs">
            {data.user.email}
          </Text>
        </Box>

        <ActionIcon color="red" onClick={onLogout} size="lg" variant="light">
          <IconLogout size={18} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
