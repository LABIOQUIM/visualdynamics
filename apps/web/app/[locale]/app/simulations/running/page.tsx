import { Box, Title } from "@mantine/core";

import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";
import { Log } from "@/components/VisualDynamics/RunningSimulation/Log/Log";
import { StepInfo } from "@/components/VisualDynamics/RunningSimulation/StepInfo/StepInfo";
import { SubmissionInfo } from "@/components/VisualDynamics/RunningSimulation/SubmissionInfo/SubmissionInfo";

import classes from "./page.module.css";

export const metadata = {
  title: "Running Simulation",
};

export default function Page() {
  return (
    <PageLayout>
      <Title>Running Simulation</Title>

      <Box className={classes.container}>
        <StepInfo />
        <Box className={classes.container_stack}>
          <SubmissionInfo />
          <Log />
        </Box>
      </Box>
    </PageLayout>
  );
}
