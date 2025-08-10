"use client";
import { useEffect, useState } from "react";
import { ActionIcon, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";

import classes from "./Heading.module.css";

interface HeadingProps {
  title: string;
  rightElement?: React.ReactNode;
}

export function Heading({ title, rightElement }: HeadingProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [historyLength, setHistoryLength] = useState(0);

  useEffect(() => {
    setHistoryLength(window.history.length);
  }, []);

  return (
    <div className={classes.container}>
      {historyLength > 1 && pathname !== "/app" && (
        <ActionIcon
          aria-label="Go back"
          onClick={router.back}
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
