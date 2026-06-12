import classes from "./Log.module.css";

import { useMemo } from "react";
import { Box, Text, Title } from "@mantine/core";
import { LazyLog } from "@melloware/react-logviewer";

import { RefetchTime } from "./RefetchTime";

const MAX_LOG_LINES = 500;

type LogProps = {
  logs: string[];
};

export function Log({ logs }: LogProps) {
  const { trimmed, skipped } = useMemo(() => {
    if (logs.length <= MAX_LOG_LINES) {
      return { trimmed: logs, skipped: 0 };
    }
    return {
      trimmed: logs.slice(0, MAX_LOG_LINES),
      skipped: logs.length - MAX_LOG_LINES,
    };
  }, [logs]);

  const text = useMemo(() => trimmed.join("\n"), [trimmed]);

  return (
    <Box className={classes.container}>
      <Box className={classes.containerTitle}>
        <Title order={3}>Logs</Title>
        <RefetchTime />
      </Box>
      {skipped > 0 && (
        <Text c="dimmed" mb={4} size="xs">
          Showing last {MAX_LOG_LINES} lines ({skipped} earlier lines omitted)
        </Text>
      )}
      <Box className={classes.logContainer}>
        <LazyLog caseInsensitive enableSearch text={text} wrapLines />
      </Box>
    </Box>
  );
}
