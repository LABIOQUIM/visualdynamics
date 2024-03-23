import { Box, Loader } from "@mantine/core";

import classes from "./LoadingBox.module.css";

export function LoadingBox() {
  return (
    <Box className={classes.container}>
      <Loader color="blue" />
    </Box>
  );
}
