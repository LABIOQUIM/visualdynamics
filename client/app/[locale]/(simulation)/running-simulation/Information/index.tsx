"use client";
import { useEffect } from "react";

import { Details } from "@/app/[locale]/(simulation)/running-simulation/Information/Details";
import { RealtimeLog } from "@/app/[locale]/(simulation)/running-simulation/Information/RealtimeLog";
import { Steps } from "@/app/[locale]/(simulation)/running-simulation/Information/Steps";
import { useRunningSimulation } from "@/app/[locale]/(simulation)/running-simulation/useRunningSimulation";
import { AbortSimulationButton } from "@/components/AbortSimulationButton";

type Props = {
  username: string;
};

export function SimulationInformation({ username }: Props) {
  const { data, isRefetching, refetch } = useRunningSimulation(username);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data || data.status !== "running") {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
        <Details info={data.info} />
        <AbortSimulationButton
          folder={data.info.folder}
          taskId={data.info.celeryId}
        />
      </div>
      <Steps activeSteps={data.steps} />
      <RealtimeLog
        logLines={data.log}
        isRefetching={isRefetching}
      />
    </div>
  );
}
