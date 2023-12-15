"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { ACPYPEForm } from "@/app/[locale]/(simulation)/new-simulation/acpype";
import { createNewACPYPESimulation } from "@/app/[locale]/(simulation)/new-simulation/acpype/createNewACPYPESimulation";
import { APOForm } from "@/app/[locale]/(simulation)/new-simulation/apo";
import { createNewAPOSimulation } from "@/app/[locale]/(simulation)/new-simulation/apo/createNewAPOSimulation";
import { PRODRGForm } from "@/app/[locale]/(simulation)/new-simulation/prodrg";
import { createNewPRODRGSimulation } from "@/app/[locale]/(simulation)/new-simulation/prodrg/createNewPRODRGSimulation";
import { TypeSelector } from "@/app/[locale]/(simulation)/new-simulation/TypeSelector";
import { getSimulations } from "@/app/[locale]/(simulation)/simulations/getSimulations";
import { PageLayout } from "@/components/Layouts/PageLayout";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H1 } from "@/components/Typography";
import { useI18n } from "@/locales/client";

type Props = {
  searchParams: {
    type: "apo" | "prodrg" | "acpype" | undefined;
  };
};

export default function Page({ searchParams }: Props) {
  const { data: session } = useSession();
  const t = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      const stayOrRedirect = (simulation: Simulation) => {
        if (simulation.status === "QUEUED" || simulation.status === "RUNNING") {
          router.replace("/running-simulation");
        }
      };

      getSimulations(session.user.username).then((simulations) => {
        if (simulations) {
          if (simulations.apo) stayOrRedirect(simulations.apo);
          if (simulations.acpype) stayOrRedirect(simulations.acpype);
          if (simulations.prodrg) stayOrRedirect(simulations.prodrg);
        }
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (loading) {
    return (
      <PageLayout className="items-center justify-center">
        <Spinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <H1>{t("new-simulation.title")}</H1>
      {searchParams.type === undefined ? <TypeSelector /> : null}
      {searchParams.type === "apo" && (
        <APOForm createNewAPOSimulation={createNewAPOSimulation} />
      )}
      {searchParams.type === "acpype" && (
        <ACPYPEForm createNewACPYPESimulation={createNewACPYPESimulation} />
      )}
      {searchParams.type === "prodrg" && (
        <PRODRGForm createNewPRODRGSimulation={createNewPRODRGSimulation} />
      )}
    </PageLayout>
  );
}
