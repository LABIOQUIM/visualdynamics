import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { queryClient } from "@/lib/queryClient";
import { getI18n } from "@/locales/server";

import { triggerRun } from "./TriggerRun/triggerRun";
import { QueuedSimulationsList } from "./QueuedSimulationsList";
import { RunningSimulationsList } from "./RunningSimulationsList";
import { TriggerRun } from "./TriggerRun";

export default async function Page() {
  const t = await getI18n();

  return (
    <PageLayout>
      <div className="flex items-center justify-between gap-x-2">
        <H1 className="uppercase">{t("admin.simulations.title")}</H1>
        <TriggerRun triggerRun={triggerRun} />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RunningSimulationsList />
        <QueuedSimulationsList />
      </HydrationBoundary>
    </PageLayout>
  );
}
