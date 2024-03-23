"use client";
import { Box, Button, Modal, Text, Title } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";

import { EmailValidationData } from "@/actions/auth/getEmailValidationData";
import { validateUserEmail } from "@/actions/auth/validateUserEmail";
import { Alert } from "@/components/Alert";
import { LoadingBox } from "@/components/LoadingBox";
import { useEmailValidationData } from "@/hooks/auth/useEmailValidationData";

import classes from "./EmailValidationModal.module.css";

function InvalidValidationCode() {
  const router = useRouter();

  const goBack = () => router.replace("/");

  return (
    <Box className={classes.contentContainer}>
      <Alert
        status={{
          status: "warning",
          title: "This validation code is invalid",
          message:
            "The validation code provided doesn't represent any account.",
        }}
      />
      <Button onClick={goBack}>Go back</Button>
    </Box>
  );
}

interface EmailValidationContentProps {
  data: EmailValidationData;
}

function EmailValidationContent({ data }: EmailValidationContentProps) {
  const router = useRouter();

  const doValidation = () => {
    validateUserEmail(data.id).then((hasValidated) => {
      if (hasValidated) {
        router.replace("/?do=login&from=email-validation");
      } else {
        router.replace(`/?validationCode=${data.id}&errored=true`);
      }
    });
  };

  return (
    <Box className={classes.contentContainer}>
      <Title className={classes.contentHeaderText} order={3}>
        Hey there, {data.user.firstName}
      </Title>
      <Text className={classes.contentText}>
        We needed to validate your email to ensure you had a working email in
        case of any contact needed.
      </Text>
      <Text className={classes.contentText}>
        By clicking &lsquo;Validate&rsquo; below, the email{" "}
        <b>{data.user.email}</b> will be used as our main way to contact you.
      </Text>
      <Button onClick={doValidation}>Validate</Button>
    </Box>
  );
}

function EmailValidationUsedContent({ data }: EmailValidationContentProps) {
  const router = useRouter();

  const goBack = () => router.replace("/");

  return (
    <Box className={classes.contentContainer}>
      <Title className={classes.contentHeaderText} order={3}>
        Hey there, {data.user.firstName}
      </Title>
      <Text className={classes.contentText}>
        Your email has already been validated, if needed be, we&apos;ll contact
        you via <b>{data.user.email}</b>
      </Text>
      <Button onClick={goBack}>Go back</Button>
    </Box>
  );
}

export function EmailValidationModal() {
  const validationCode = useSearchParams().get("validationCode");
  const { data } = useEmailValidationData(validationCode);

  return (
    <Modal
      centered
      classNames={{
        title: classes.modalTitle,
      }}
      withCloseButton={false}
      onClose={() => null}
      opened={!!validationCode}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      size="md"
      title="Validate Email"
    >
      {data === undefined && <LoadingBox />}
      {data === null && <InvalidValidationCode />}
      {data && data !== null && !data.used && (
        <EmailValidationContent data={data} />
      )}
      {data && data !== null && data.used && (
        <EmailValidationUsedContent data={data} />
      )}
    </Modal>
  );
}
