"use client";
import { useEffect } from "react";
import { Cog } from "lucide-react";

import { Details } from "@/app/[locale]/(app)/(simulation)/running-simulation/Information/Details";
import { RealtimeLog } from "@/app/[locale]/(app)/(simulation)/running-simulation/Information/RealtimeLog";
import { Steps } from "@/app/[locale]/(app)/(simulation)/running-simulation/Information/Steps";
import { useRunningSimulation } from "@/app/[locale]/(app)/(simulation)/running-simulation/useRunningSimulation";
import { AbortSimulationButton } from "@/components/AbortSimulationButton";
import { H2, Paragraph } from "@/components/Typography";
import { useI18n } from "@/locales/client";

type Props = {
  username: string;
};

export function SimulationInformation({ username }: Props) {
  const { data, isRefetching, refetch } = useRunningSimulation(username);
  const t = useI18n();

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) {
    return null;
  }

  if (data.status !== "running") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Cog className="h-16 w-16" />
        <H2>{t("running-simulation.not-running.title")}</H2>
        <Paragraph>{t("running-simulation.not-running.description")}</Paragraph>
      </div>
    );
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
