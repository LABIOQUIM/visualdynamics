import { Blockquote, type BlockquoteProps, Title } from "@mantine/core";
import {
  IconCheck,
  IconCircleX,
  IconExclamationCircle,
  IconInfoCircle,
} from "@tabler/icons-react";

interface Props extends BlockquoteProps {
  status: FormSubmissionStatus;
}

export function Alert({ status, ...rest }: Props) {
  const data = {
    error: {
      color: "red",
      Icon: <IconCircleX />,
    },
    info: {
      color: "indigo",
      Icon: <IconInfoCircle />,
    },
    warning: {
      color: "orange",
      Icon: <IconExclamationCircle />,
    },
    success: {
      color: "green",
      Icon: <IconCheck />,
    },
  };

  if (status.status === "loading") {
    return null;
  }

  const statusData = data[status.status];

  return (
    <Blockquote
      color={statusData.color}
      icon={statusData.Icon}
      p="xs"
      pl="xl"
      {...rest}
    >
      <Title c={`${statusData.color}.7`} size="h4">
        {status.title}
      </Title>
      {status.message}
    </Blockquote>
  );
}
