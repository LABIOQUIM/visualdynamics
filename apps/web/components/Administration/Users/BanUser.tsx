"use client";
import { useState } from "react";
import { ActionIcon, Box, Button, Modal, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCancel, IconHammer, IconHammerOff } from "@tabler/icons-react";
import { User } from "database";

import { updateUser } from "@/actions/administration/updateUser";
import { Alert } from "@/components/Alerts/Alert";

import classes from "./BanUser.module.css";

interface Props {
  user: Omit<User, "password">;
  refetch(): void;
}

export function BanUser({ user, refetch }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [status, setStatus] = useState<FormSubmissionStatus>();

  async function doBan() {
    setStatus({ status: "loading" });
    const result = await updateUser(user, {
      status:
        user.status === "DISABLED_BY_ADMINISTRATOR"
          ? "ACTIVE"
          : "DISABLED_BY_ADMINISTRATOR",
    });

    if (result !== "success") {
      setStatus({
        status: "warning",
        title: `Something went wrong: ${result}`,
      });
      notifications.show({
        message: `Something went wrong: ${result}`,
        color: "orange",
      });
    } else {
      setStatus({
        status: "success",
        title: `User ${user.userName} updated.`,
      });
      notifications.show({
        message: `User ${user.userName} updated.`,
        color: "green",
      });
      refetch();
      close();
    }
  }

  function onClose() {
    close();
    setStatus(undefined);
  }

  const userIdentification = `${user.userName} (${user.firstName} ${user.lastName})`;

  const isBanned = user.status === "DISABLED_BY_ADMINISTRATOR";

  return (
    <>
      <Modal
        centered
        classNames={{
          title: classes.modalTitle,
        }}
        onClose={onClose}
        opened={opened}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size="md"
        title="Ban User"
      >
        {status && status.status !== "loading" && <Alert status={status} />}
        <Box className={classes.container}>
          <Text>
            Are you sure you want to <b>{isBanned ? "unban" : "soft ban"}</b>{" "}
            the user <b>{userIdentification}</b>?
          </Text>
          <Box className={classes.row_container}>
            <Button
              color="gray"
              leftSection={<IconCancel />}
              onClick={onClose}
              type="button"
              variant="light"
            >
              Cancel
            </Button>
            <Button
              color={isBanned ? "grape" : "red"}
              leftSection={isBanned ? <IconHammerOff /> : <IconHammer />}
              onClick={doBan}
            >
              {isBanned ? "UNBAN" : "BAN"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Tooltip label={isBanned ? "Unban User" : "Ban User"} withArrow>
        <ActionIcon
          color={isBanned ? "grape" : "red"}
          variant="light"
          size="lg"
          title={isBanned ? "Unban User" : "Ban User"}
          onClick={open}
        >
          {isBanned ? <IconHammerOff /> : <IconHammer />}
        </ActionIcon>
      </Tooltip>
    </>
  );
}
