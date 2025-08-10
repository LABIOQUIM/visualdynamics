"use client";
import { useState } from "react";
import { ActionIcon, Box, Button, Modal, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { render } from "@react-email/components";
import { IconCancel, IconMailForward } from "@tabler/icons-react";
import { User } from "database";

import { createUserValidation } from "@/actions/administration/createUserValidation";
import { sendMail } from "@/actions/utils/sendMail";
import { Alert } from "@/components/Alerts/Alert";
import AccountActivationEmail from "@/emails/account/Activation";

import classes from "./UpdateUser.module.css";

interface Props {
  user: Omit<User, "password">;
}

export function ResendValidationEmail({ user }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [status, setStatus] = useState<FormSubmissionStatus>();

  async function doResend() {
    console.log("Resending");
    setStatus({ status: "loading" });
    const validationId = await createUserValidation(user.id);

    if (
      !validationId ||
      validationId === "failure" ||
      validationId === "unauthenticated" ||
      validationId === "unauthorized"
    ) {
      console.log("resendValidationMail: failed to generate validationId");
      return;
    }

    const html = await render(
      <AccountActivationEmail
        email={user.email}
        firstName={user.firstName}
        validationURL={`${window.location.protocol}//${window.location.host}/account/email-validation/${validationId}`}
      />
    );

    const result = await sendMail(
      user.email,
      html,
      "[LABIOQUIM] Your account activation link."
    );

    if (result !== "success") {
      notifications.show({
        message: `Something went wrong: ${result}`,
        color: "orange",
      });
      setStatus({
        status: "warning",
        title: `Something went wrong: ${result}`,
      });
    } else {
      notifications.show({
        message: `Sent ${user.userName} a new validation email.`,
        color: "green",
      });
      setStatus({
        status: "success",
        title: `Sent ${user.userName} a new validation email.`,
      });
      close();
    }
  }

  function onClose() {
    close();
    setStatus(undefined);
  }

  let userIdentification = `${user.userName} (${user.firstName}`;

  if (user.lastName) {
    userIdentification += ` ${user.lastName}`;
  }

  userIdentification += ")";

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
        title="Resend Validation Email"
      >
        {status && status.status !== "loading" && <Alert status={status} />}
        <Box className={classes.formContainer}>
          <Text>
            Are you sure you want to resend the activation email to the user{" "}
            <b>{userIdentification}</b>?
          </Text>
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
            <Button
              color="teal"
              leftSection={<IconMailForward />}
              onClick={doResend}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Modal>

      <Tooltip label="Resend Validation Email" withArrow>
        <ActionIcon color="teal" variant="light" size="lg" onClick={open}>
          <IconMailForward />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
