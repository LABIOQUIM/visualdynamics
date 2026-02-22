import classes from "./$simulationId.module.css";

import { Tabs } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Download } from "./-components/Download";
import { ExecutionProgress } from "./-components/ExecutionProgress";
import { Overview } from "./-components/Overview";
import { Visualizer } from "./-components/Visualizer";

import { PageLayout } from "@/components/PageLayout";
import { getSimulation } from "@/queries/getSimulation";

export const Route = createFileRoute("/app/simulations/$simulationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const simulationId = Route.useParams().simulationId;

  const { data } = useQuery(getSimulation(simulationId));

  if (!data) {
    return null;
  }

  return (
    <PageLayout>
      <Tabs
        classNames={{
          root: classes.tabsContainer,
          panel: classes.tabPanel,
        }}
        defaultValue="overview"
      >
        <Tabs.List>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="run">Run</Tabs.Tab>
          <Tabs.Tab
            disabled={data.simulation.status === "RUNNING"}
            value="3d-vis"
          >
            3D Visualizer
          </Tabs.Tab>
          <Tabs.Tab value="downloads">Downloads</Tabs.Tab>
          <Tabs.Tab disabled value="job-id">
            Job ID: {data.jobId}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Overview simulationId={simulationId} />
        </Tabs.Panel>

        <Tabs.Panel value="3d-vis">
          <Visualizer simulationId={simulationId} />
        </Tabs.Panel>

        <Tabs.Panel value="downloads">
          <Download simulationId={simulationId} />
        </Tabs.Panel>

        <Tabs.Panel value="run">
          <ExecutionProgress simulationId={simulationId} />
        </Tabs.Panel>
      </Tabs>
    </PageLayout>
  );
}
