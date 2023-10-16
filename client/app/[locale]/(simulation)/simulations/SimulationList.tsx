"use client";
import { SignalZero } from "lucide-react";

import { Header } from "@/app/[locale]/(simulation)/simulations/Header";
import { SimulationCard } from "@/app/[locale]/(simulation)/simulations/SimulationCard";
import { H2, Paragraph } from "@/components/Typography";
import { useI18n } from "@/locales/client";

import { useSimulations } from "./useSimulations";

type Props = {
  username: string;
};

export function SimulationList({ username }: Props) {
  const { data, refetch } = useSimulations(username);
  const t = useI18n();

  if (!data || (!data.apo && !data.acpype && !data.prodrg)) {
    return (
      <div className="flex flex-1 flex-col gap-2">
        <Header refetch={refetch} />
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <SignalZero className="h-24 w-24 text-primary-600" />
          <H2>{t("simulations.empty.title")}</H2>
          <Paragraph>{t("simulations.empty.description")}</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Header refetch={refetch} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="flex flex-col gap-2">
          <H2>{t("navigation.simulations.models.apo")}</H2>
          <SimulationCard simulation={data.apo} />
        </div>
        <div className="flex flex-col gap-2">
          <H2>{t("navigation.simulations.models.acpype")}</H2>
          <SimulationCard simulation={data.acpype} />
        </div>
        <div className="flex flex-col gap-2">
          <H2>{t("navigation.simulations.models.prodrg")}</H2>
          <SimulationCard simulation={data.prodrg} />
        </div>
      </div>
    </div>
  );
}
