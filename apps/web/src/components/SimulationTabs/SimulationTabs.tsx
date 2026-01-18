import classes from "./SimulationTabs.module.css";

import { Alert, Tabs } from "@mantine/core";
import {
  IconAlertTriangle,
  IconBadge3d,
  IconDownload,
  IconRun,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useQueryState } from "nuqs";

import { ArtifactDownload } from "../ArtifactDownload";
import { SimulationLog } from "../SimulationLog";
import { SimulationSteps } from "../SimulationSteps";
import { ThreeDViewer } from "../ThreeDViewer/ThreeDViewer";

import { nuqsKeys } from "@/lib/constants";
import { latestMacromoleculesQuery } from "@/queries/latestMacromolecules";
import { latestSimulationsQuery } from "@/queries/latestSimulations";

const asType = <T,>(v: unknown): T => v as T;

export function SimulationTabs() {
  const { data } = useQuery(latestSimulationsQuery);
  const [type] = useQueryState<SimulationDetails | null>(
    nuqsKeys.SIMULATION_EXPANDED_DETAILS,
    { defaultValue: null, parse: asType<SimulationDetails | null> },
  );

  const [tab, setTab] = useQueryState<SimulationDetailsActiveTab>(
    nuqsKeys.SIMULATION_EXPANDED_DETAILS_ACTIVE_TAB,
    {
      defaultValue: "3d-viewer",
      parse: asType<SimulationDetailsActiveTab>,
    },
  );
  const { data: macromolecules } = useQuery(latestMacromoleculesQuery(type));

  if (!data) {
    return null;
  }

  const activeSimulation = data[type];

  if (!activeSimulation) {
    return null;
  }

  return (
    <Tabs
      className={classes.tabsContainer}
      onChange={(e) => setTab(e as SimulationDetailsActiveTab)}
      value={tab}
      variant="pills"
    >
      <Tabs.List>
        <Tabs.Tab
          disabled={
            activeSimulation.status !== "RUNNING" &&
            activeSimulation.status !== "QUEUED"
          }
          leftSection={<IconRun size={12} />}
          value="run"
        >
          Run
        </Tabs.Tab>
        <Tabs.Tab leftSection={<IconBadge3d size={12} />} value="3d-viewer">
          3D Viewer
        </Tabs.Tab>
        <Tabs.Tab leftSection={<IconDownload size={12} />} value="downloads">
          Downloads
        </Tabs.Tab>
        <Tabs.Tab
          color="red"
          disabled={activeSimulation.status !== "ERRORED"}
          leftSection={<IconAlertTriangle size={12} />}
          value="errored"
        >
          Error Cause
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel
        className={clsx(classes.tabsPanelContainer, classes.tabsPanelRun)}
        value="run"
      >
        <SimulationSteps simulationId={activeSimulation.id} />
        <SimulationLog simulationId={activeSimulation.id} />
      </Tabs.Panel>

      <Tabs.Panel className={classes.tabsPanelContainer} value="3d-viewer">
        <ThreeDViewer macromolecules={macromolecules} />
      </Tabs.Panel>

      <Tabs.Panel
        className={clsx(classes.tabsPanelContainer, classes.tabsPanelDownload)}
        value="downloads"
      >
        <ArtifactDownload simulation={activeSimulation} target="commands" />
        <ArtifactDownload simulation={activeSimulation} target="figures" />
        <ArtifactDownload simulation={activeSimulation} target="logs" />
        <ArtifactDownload simulation={activeSimulation} target="results" />
      </Tabs.Panel>

      <Tabs.Panel className={classes.tabsPanelContainer} value="errored">
        <Alert color="red" title="Error">
          {activeSimulation.errorCause}
        </Alert>
      </Tabs.Panel>
    </Tabs>
  );
}
