"use client";
import { Header } from "@/app/[locale]/(simulation)/simulations/Header";
import { SimulationCard } from "@/app/[locale]/(simulation)/simulations/SimulationCard";

import { useSimulations } from "./useSimulations";

type Props = {
  username: string;
};

export function SimulationList({ username }: Props) {
  const { data, refetch } = useSimulations(username);

  if (!data || data.status !== "has-simulations") {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <Header refetch={refetch} />
      {data.simulations.map((simulation) => (
        <SimulationCard
          key={simulation.celeryId}
          simulation={simulation}
        />
      ))}
    </div>
  );
}
