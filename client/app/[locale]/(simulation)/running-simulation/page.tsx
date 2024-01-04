import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Cog } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import {
  getRunningSimulation,
  GetRunningSimulationResult
} from "@/app/[locale]/(simulation)/running-simulation/getRunningSimulation";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H1, H2, Paragraph } from "@/components/Typography";
import { authOptions } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { getI18n } from "@/locales/server";

import { SimulationInformation } from "./Information";

// export function generateMetadata() {
//   const t = await getI18n();
//   return {
//     title: t("running-simulation.description")
//   };
// }

export default async function Page() {
  const t = await getI18n();
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?reason=unauthenticated");
  }

  queryClient.prefetchQuery({
    queryKey: ["RunningSimulation", session.user.username],
    queryFn: () => getRunningSimulation(session.user.username)
  });

  const simulationData = queryClient.getQueryData<GetRunningSimulationResult>([
    "RunningSimulation",
    session.user.username
  ]);

  if (simulationData && simulationData.status === "queued") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Spinner />
        <H2>{t("running-simulation.not-running.title")}</H2>
        <Paragraph>{t("running-simulation.not-running.description")}</Paragraph>
      </div>
    );
  }

  if (simulationData && simulationData.status !== "running") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Cog className="h-16 w-16" />
        <H2>{t("running-simulation.not-running.title")}</H2>
        <Paragraph>{t("running-simulation.not-running.description")}</Paragraph>
      </div>
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageLayout>
        <H1>{t("running-simulation.title")}</H1>
        <SimulationInformation username={session.user.username} />
      </PageLayout>
    </HydrationBoundary>
  );
}

export const dynamic = "force-dynamic";
