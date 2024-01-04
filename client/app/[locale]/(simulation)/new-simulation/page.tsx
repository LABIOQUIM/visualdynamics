import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ACPYPEForm } from "@/app/[locale]/(simulation)/new-simulation/acpype";
import { APOForm } from "@/app/[locale]/(simulation)/new-simulation/apo";
import { PRODRGForm } from "@/app/[locale]/(simulation)/new-simulation/prodrg";
import { TypeSelector } from "@/app/[locale]/(simulation)/new-simulation/TypeSelector";
import { getSimulations } from "@/app/[locale]/(simulation)/simulations/getSimulations";
import { Alert } from "@/components/Alert";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { H1 } from "@/components/Typography";
import { authOptions } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { getI18n } from "@/locales/server";
import { stayOrRedirect } from "@/utils/navigation";

type Props = {
  searchParams: {
    type: "apo" | "prodrg" | "acpype" | undefined;
  };
};

export default async function Page({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const t = await getI18n();

  if (!session) {
    redirect("/login?reason=unauthenticated");
  }

  queryClient.prefetchQuery({
    queryFn: () => getSimulations(session.user.username),
    queryKey: ["SimulationList", session.user.username]
  });

  const simulations = await getSimulations(session.user.username);

  if (simulations) {
    if (simulations.apo) stayOrRedirect(simulations.apo);
    if (simulations.acpype) stayOrRedirect(simulations.acpype);
    if (simulations.prodrg) stayOrRedirect(simulations.prodrg);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageLayout>
        <H1>{t("new-simulation.title")}</H1>
        {searchParams.type === undefined ? <TypeSelector /> : null}
        {searchParams.type === "apo" && <APOForm />}
        {searchParams.type === "acpype" && <ACPYPEForm />}
        {searchParams.type === "prodrg" && <PRODRGForm />}
        <Alert status="normal">{t("new-simulation.description.general")}</Alert>
      </PageLayout>
    </HydrationBoundary>
  );
}

export const dynamic = "force-dynamic";
