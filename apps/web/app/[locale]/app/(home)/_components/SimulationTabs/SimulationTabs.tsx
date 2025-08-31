"use client";
import { Alert, Tabs } from "@mantine/core";
import {
  IconAlertTriangle,
  IconBadge3d,
  IconDownload,
  IconRun,
} from "@tabler/icons-react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { useQueryState } from "nuqs";

import { QueryParams } from "@/app/_constants/queries";
import { Log } from "@/app/[locale]/app/(home)/_components/Log/Log";
import { Loader } from "@/components/Loader/Loader";
import { useLatestSimulationMacromolecules } from "@/hooks/simulation/useLatestSimulationMacromolecules";
import { useLatestSimulations } from "@/hooks/simulation/useLatestSimulations";

import { ArtifactDownload } from "../ArtifactDownload";
import { StepInfo } from "../StepInfo/StepInfo";

import classes from "./SimulationTabs.module.css";

const ThreeDViewer = dynamic(
  () => import("../ThreeDViewer/ThreeDViewer").then((mod) => mod.ThreeDViewer),
  { ssr: false, loading: () => <Loader /> }
);

export function SimulationTabs() {
  const { data } = useLatestSimulations();
  const [expanded] = useQueryState<"apo" | "acpype" | null>(
    QueryParams.SIMULATION_EXPANDED_DETAILS,
    {
      defaultValue: null,
      parse(value) {
        return value as "apo" | "acpype" | null;
      },
    }
  );
  const [tab, setTab] = useQueryState<SimulationDetailsActiveTab>(
    QueryParams.SIMULATION_EXPANDED_DETAILS_ACTIVE_TAB,
    {
      defaultValue: "3d-viewer",
      clearOnDefault: true,
      parse(value) {
        return value as SimulationDetailsActiveTab;
      },
    }
  );
  const { data: macromolecules } = useLatestSimulationMacromolecules(expanded);

  if (!data || data === "unauthenticated") {
    return null;
  }

  const activeSimulation = data[expanded];

  if (!activeSimulation) {
    return null;
  }

  return (
    <Tabs
      className={classes.tabsContainer}
      onChange={(e) => setTab(e as SimulationDetailsActiveTab)}
      variant="pills"
      defaultValue={tab}
    >
      <Tabs.List>
        <Tabs.Tab
          disabled={
            activeSimulation.status !== "RUNNING" &&
            activeSimulation.status !== "QUEUED"
          }
          value="run"
          leftSection={<IconRun size={12} />}
        >
          Run
        </Tabs.Tab>
        <Tabs.Tab value="3d-viewer" leftSection={<IconBadge3d size={12} />}>
          3D Viewer
        </Tabs.Tab>
        <Tabs.Tab value="downloads" leftSection={<IconDownload size={12} />}>
          Downloads
        </Tabs.Tab>
        <Tabs.Tab
          disabled={activeSimulation.status !== "ERRORED"}
          value="errored"
          color="red"
          leftSection={<IconAlertTriangle size={12} />}
        >
          Error Cause
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel
        className={clsx(classes.tabsPanelContainer, classes.tabsPanelRun)}
        value="run"
      >
        <StepInfo simulationId={activeSimulation.id} />
        <Log simulationId={activeSimulation.id} />
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
        <ArtifactDownload simulation={activeSimulation} target="gromacsLogs" />
        <ArtifactDownload simulation={activeSimulation} target="results" />
      </Tabs.Panel>

      <Tabs.Panel className={classes.tabsPanelContainer} value="errored">
        <Alert title="Error" color="red">
          {activeSimulation.errorCause}
        </Alert>
      </Tabs.Panel>
    </Tabs>
  );
}
