import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { getRunningSimulation } from "@/app/[locale]/(simulation)/running-simulation/getRunningSimulation";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
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
