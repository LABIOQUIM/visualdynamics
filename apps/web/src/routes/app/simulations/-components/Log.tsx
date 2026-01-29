import classes from "./Log.module.css";

import { Box, Title } from "@mantine/core";
import { LazyLog } from "@melloware/react-logviewer";

import { RefetchTime } from "./RefetchTime";

type LogProps = {
  logs: string[];
};

export function Log({ logs }: LogProps) {
  return (
    <Box className={classes.container}>
      <Box className={classes.containerTitle}>
        <Title order={3}>Logs</Title>
        <RefetchTime />
      </Box>
      <Box className={classes.logContainer}>
        <LazyLog
          caseInsensitive
          enableSearch
          text={logs.join("\n")}
          wrapLines
        />
      </Box>
      {/*<ScrollAreaAutosize className={classes.logContainer} offsetScrollbars="y">
        {logs.map((line, idx) => (
          <Text key={line + idx}>
            {idx + 1} - {line}
          </Text>
        ))}
      </ScrollAreaAutosize>*/}
    </Box>
  );
}
