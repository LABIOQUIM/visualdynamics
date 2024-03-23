import { Alert as MAlert, AlertProps } from "@mantine/core";
import {
  IconCheck,
  IconCircleX,
  IconExclamationCircle,
  IconInfoCircle,
} from "@tabler/icons-react";

interface Props extends AlertProps {
  status: FormSubmissionStatus;
}

export function Alert({ status, ...rest }: Props) {
  if (status.status === "error") {
    return (
      <MAlert
        color="red"
        icon={<IconCircleX />}
        title={status.title}
        variant="light"
        {...rest}
      >
        {status.message}
      </MAlert>
    );
  }

  if (status.status === "info") {
    return (
      <MAlert
        color="indigo"
        icon={<IconInfoCircle />}
        title={status.title}
        variant="light"
        {...rest}
      >
        {status.message}
      </MAlert>
    );
  }

  if (status.status === "warning") {
    return (
      <MAlert
        color="orange"
        icon={<IconExclamationCircle />}
        title={status.title}
        variant="light"
        {...rest}
      >
        {status.message}
      </MAlert>
    );
  }

  if (status.status === "success") {
    return (
      <MAlert
        color="green"
        icon={<IconCheck />}
        title={status.title}
        variant="light"
        {...rest}
      >
        {status.message}
      </MAlert>
    );
  }
}
