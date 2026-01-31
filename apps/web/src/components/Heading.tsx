import classes from "./Heading.module.css";

import { ActionIcon, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useCanGoBack, useLocation, useRouter } from "@tanstack/react-router";

import { parsePathname } from "@/lib/utils";

interface HeadingProps {
  title: string;
  rightElement?: React.ReactNode;
  centered?: boolean;
}

export function Heading({ centered, rightElement, title }: HeadingProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const pathname = useLocation({
    select: (location) => parsePathname(location.pathname),
  });

  return (
    <div className={classes.container} data-centered={centered}>
      {canGoBack && pathname !== "/app" && (
        <ActionIcon
          aria-label="Go back"
          onClick={() => router.history.back()}
          size="lg"
          variant="subtle"
        >
          <IconArrowLeft className={classes.icon} />
        </ActionIcon>
      )}
      <Title order={2}>{title}</Title>
      {rightElement ? (
        <div className={classes.rightElementContainer}>{rightElement}</div>
      ) : null}
    </div>
  );
}
