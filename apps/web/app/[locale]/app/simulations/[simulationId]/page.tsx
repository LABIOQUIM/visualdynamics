import { Box, Title } from "@mantine/core";

import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";
import { Log } from "@/components/VisualDynamics/RunningSimulation/Log/Log";
import { StepInfo } from "@/components/VisualDynamics/RunningSimulation/StepInfo/StepInfo";
import { SubmissionInfo } from "@/components/VisualDynamics/RunningSimulation/SubmissionInfo/SubmissionInfo";

import classes from "./page.module.css";

export const metadata = {
  title: "Running Simulation",
};

interface Props {
  params: Promise<{
    simulationId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { simulationId } = await params;

  return (
    <PageLayout>
      <Title>Running Simulation</Title>

      <Box className={classes.container}>
        <StepInfo simulationId={simulationId} />
        <Box className={classes.container_stack}>
          <SubmissionInfo simulationId={simulationId} />
          <Log simulationId={simulationId} />
        </Box>
      </Box>
    </PageLayout>
  );
}
