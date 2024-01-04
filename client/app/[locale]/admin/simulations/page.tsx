import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { getQueuedSimulations } from "@/app/[locale]/admin/simulations/QueuedSimulationsList/getQueuedSimulations";
import { getRunningSimulations } from "@/app/[locale]/admin/simulations/RunningSimulationsList/getRunningSimulations";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { authOptions } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { getI18n } from "@/locales/server";

import { triggerRun } from "./TriggerRun/triggerRun";
import { QueuedSimulationsList } from "./QueuedSimulationsList";
import { RunningSimulationsList } from "./RunningSimulationsList";
import { TriggerRun } from "./TriggerRun";

export async function generateMetadata() {
  const t = await getI18n();

  return {
    title: t("admin.simulations.title")
  };
}

export default async function Page() {
  const t = await getI18n();
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?reason=unauthenticated");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/simulations?reason=unauthorized");
  }

  await queryClient.prefetchQuery({
    queryKey: ["QueuedSimulations"],
    queryFn: () => getQueuedSimulations()
  });

  await queryClient.prefetchQuery({
    queryKey: ["RunningSimulations"],
    queryFn: () => getRunningSimulations()
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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
    </HydrationBoundary>
  );
}

export const dynamic = "force-dynamic";
