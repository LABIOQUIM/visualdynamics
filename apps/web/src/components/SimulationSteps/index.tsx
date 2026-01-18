import classes from "./SimulationSteps.module.css";

import { Fragment } from "react";
import { ScrollArea, Title } from "@mantine/core";
import { IconArrowDown } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { Step } from "./Step";

import { runningSimulationQuery } from "@/queries/runningSimulation";

const steps = {
  topology: "Topology definition",
  solvate: "Defining Box and Solvating",
  ions: "Adding Ions",
  minimizationsteepdesc: "Steep Descent Minimization",
  // minimizationconjgrad: "Conjugate Gradient Minimization",
  equilibrationnvt: "NVT Equilibration",
  equilibrationnpt: "NPT Equilibration",
  productionmd: "MD Production",
  analyzemd: "MD Analysis",
};

interface Props {
  simulationId: string;
}

export function SimulationSteps({ simulationId }: Props) {
  const { data, isLoading, isError } = useQuery(
    runningSimulationQuery(simulationId),
  );

  if (!data || isLoading || isError) {
    return null;
  }

  if (data.status === "not-running" || data.status === "queued") {
    return null;
  }

  return (
    <ScrollArea className={classes.container}>
      <Title order={3}>Steps</Title>
      {Object.entries(steps).map(([key, value]) => {
        const isRunning = data.stepData[data.stepData.length - 1] === `#${key}`;
        const isDone = data.stepData
          .slice(0, data.stepData.length - 1)
          .some((k) => k === `#${key}`);

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
    </ScrollArea>
  );
}
