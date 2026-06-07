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

export const Route = createFileRoute("/_protected/simulations/$simulationId")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(
      getSimulation(params.simulationId),
    );
    return { moleculeName: data.simulation.moleculeName };
  },
  staticData: {
    breadcrumb: ({ loaderData }) => loaderData?.moleculeName ?? "...",
  },
});

function RouteComponent() {
  const simulationId = Route.useParams().simulationId;

  const { data } = useQuery(getSimulation(simulationId));

  if (!data) {
    return null;
  }

  return (
    <PageLayout title={data.simulation.moleculeName}>
      <Tabs
        classNames={{
          root: classes.tabsContainer,
          panel: classes.tabPanel,
        }}
        defaultValue="overview"
      >
        <Tabs.List style={{ overflowX: "auto", flexWrap: "nowrap" }}>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="run">Run</Tabs.Tab>
          <Tabs.Tab
            disabled={data.simulation.status === "RUNNING"}
            value="3d-vis"
          >
            3D Visualizer
          </Tabs.Tab>
          <Tabs.Tab value="downloads">Downloads</Tabs.Tab>
          <Tabs.Tab className={classes.jobIdTab} disabled value="job-id">
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
