import type { ErrorComponentProps } from "@tanstack/react-router";

import { Anchor, Button, Code, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react";

import BrandLogoImage from "@/assets/visualdynamics.svg";

import classes from "./ErrorBoundary.module.css";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return "An unexpected error interrupted this page.";
}

function getErrorStack(error: unknown) {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }

  return null;
}

export function AppErrorBoundary({ error, info, reset }: ErrorComponentProps) {
  const message = getErrorMessage(error);
  const stack = getErrorStack(error);
  const showDetails = import.meta.env.DEV && (stack || info?.componentStack);

  return (
    <main className={classes.shell}>
      <Paper className={classes.panel} p={{ base: "lg", sm: "xl" }} radius="md" withBorder>
        <Stack gap="lg">
          <Anchor className={classes.logo} href="/">
            <img alt="Visual Dynamics" className={classes.logoImage} src={BrandLogoImage} />
          </Anchor>

          <Group align="flex-start" gap="md" wrap="nowrap">
            <ThemeIcon className={classes.icon} color="red" radius="xl" size={44} variant="light">
              <IconAlertTriangle size={24} />
            </ThemeIcon>

            <Stack gap="xs">
              <Title order={1} size="h2">
                This page could not be loaded
              </Title>
              <Text c="dimmed" maw={560}>
                Visual Dynamics ran into a problem while preparing this view. You can retry the
                page or return to the home page.
              </Text>
            </Stack>
          </Group>

          <Code block className={classes.details}>
            {message}
          </Code>

          {showDetails ? (
            <Code block className={classes.details}>
              {[stack, info?.componentStack].filter(Boolean).join("\n\n")}
            </Code>
          ) : null}

          <Group>
            <Button leftSection={<IconRefresh size={18} />} onClick={reset}>
              Try again
            </Button>
            <Button component="a" href="/" leftSection={<IconHome size={18} />} variant="default">
              Go home
            </Button>
          </Group>
        </Stack>
      </Paper>
    </main>
  );
}
