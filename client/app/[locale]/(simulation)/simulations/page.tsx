import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { getSimulations } from "@/app/[locale]/(simulation)/simulations/getSimulations";
import { SimulationList } from "@/app/[locale]/(simulation)/simulations/SimulationList";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { authOptions } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?reason=unauthenticated");
  }

  queryClient.prefetchQuery({
    queryFn: () => getSimulations(session.user.username),
    queryKey: ["SimulationList", session.user.username]
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageLayout>
        <SimulationList username={session.user.username} />
      </PageLayout>
    </HydrationBoundary>
  );
}

export const dynamic = "force-dynamic";
