import { Box, Loader, Text } from "@mantine/core";
import { IconCircleCheckFilled, IconClockPause } from "@tabler/icons-react";

import classes from "./Step.module.css";

interface Props {
  state: StepState;
  label: string;
}

const Icons = {
  done: IconCircleCheckFilled,
  waiting: IconClockPause,
};

export function Step({ label, state }: Props) {
  let Icon;

  if (state !== "inprogress") {
    Icon = Icons[state];
  }

  return (
    <Box className={classes.step_container} title={label}>
      <Box className={classes.step_icon_container}>
        {state === "inprogress" ? <Loader size="sm" /> : Icon && <Icon />}
      </Box>
      <Text truncate="end">{label}</Text>
    </Box>
  );
}
