"use client";
import { useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  Modal,
  Select,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCancel, IconCheck, IconUserEdit } from "@tabler/icons-react";
import { Prisma, User } from "database";

import { updateUser } from "@/actions/administration/updateUser";
import { Alert } from "@/components/Alerts/Alert";

import classes from "./UpdateUser.module.css";

interface Props {
  user: Omit<User, "password">;
  refetch(): void;
}

export function UpdateUser({ user, refetch }: Props) {
  const { getInputProps, onSubmit, reset } = useForm<Prisma.UserUpdateInput>({
    initialValues: {
      userName: user.userName,
      email: user.email,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      role: user.role,
    },
  });
  const [opened, { open, close }] = useDisclosure(false);
  const [status, setStatus] = useState<FormSubmissionStatus>();

  async function doUpdate(updatedUser: Prisma.UserUpdateInput) {
    setStatus({ status: "loading" });
    const result = await updateUser(user, updatedUser);

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
    reset();
    close();
    setStatus(undefined);
  }

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
        title="Update User"
      >
        {status && status.status !== "loading" && <Alert status={status} />}
        <Box
          component="form"
          className={classes.formContainer}
          onSubmit={onSubmit(doUpdate)}
        >
          <TextInput
            disabled
            label="Username"
            withAsterisk
            {...getInputProps("userName")}
          />
          <Box className={classes.row_container}>
            <TextInput
              label="First Name"
              withAsterisk
              {...getInputProps("firstName")}
            />
            <TextInput
              label="Last Name"
              withAsterisk
              {...getInputProps("lastName")}
            />
          </Box>
          <TextInput label="Email" withAsterisk {...getInputProps("email")} />
          <Select
            label="Role"
            data={["USER", "ADMINISTRATOR"]}
            {...getInputProps("role")}
          />

          <Box className={classes.row_container}>
            <Button
              color="red"
              leftSection={<IconCancel />}
              onClick={onClose}
              type="button"
              variant="light"
            >
              Cancel
            </Button>
            <Button color="green" leftSection={<IconCheck />} type="submit">
              Update
            </Button>
          </Box>
        </Box>
      </Modal>

      <Tooltip label="Edit User" withArrow>
        <ActionIcon variant="light" size="lg" onClick={open}>
          <IconUserEdit />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
