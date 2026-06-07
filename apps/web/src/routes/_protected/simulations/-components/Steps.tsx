import classes from "./Steps.module.css";

import { Fragment } from "react";
import { Box, Title } from "@mantine/core";
import { IconArrowDown } from "@tabler/icons-react";

import { Step } from "./Step";

const steps = {
  topology: "Topology definition",
  solvate: "Defining Box and Solvating",
  ions: "Adding Ions",
  minimizationsteepdesc: "Steep Descent Minimization",
  equilibrationnvt: "NVT Equilibration",
  equilibrationnpt: "NPT Equilibration",
  productionmd: "MD Production",
  analyzemd: "MD Analysis",
};

type StepsProps = {
  stepsDone: string[];
  isSimulationRunning: boolean;
};

export function Steps({ stepsDone, isSimulationRunning }: StepsProps) {
  return (
    <Box className={classes.container}>
      <Title order={3}>Steps</Title>
      {Object.entries(steps).map(([key, value]) => {
        const isRunning =
          stepsDone[stepsDone.length - 1] === `#${key}` && isSimulationRunning;
        const isDone = stepsDone.some((k) => k === `#${key}`);

        let state: StepState = "waiting";

        if (isDone) {
          state = "done";
        }

        if (isRunning) {
          state = "inprogress";
        }

        return (
          <Fragment key={key}>
            <Step label={value} state={state} />
            {key !== "analyzemd" && (
              <IconArrowDown className={classes.arrow_down_icon} />
            )}
          </Fragment>
        );
      })}
    </Box>
  );
}
