"use client";
import { useEffect } from "react";
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

  if (!data || data.length === 0) {
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
      {data.map((simulation) => (
        <SimulationCard
          key={simulation.id}
          simulation={simulation}
        />
      ))}
    </div>
  );
}
