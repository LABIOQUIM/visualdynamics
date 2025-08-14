import { Title } from "@mantine/core";
import { SIMULATION_TYPE } from "database";

import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";
import { NewSimulationForm } from "@/components/VisualDynamics/NewSimulationForm";

interface Props {
  params: Promise<{
    simulationType: SIMULATION_TYPE;
  }>;
}

export const metadata = {
  title: "New Simulation",
};

export default async function NewSimulationPage({ params }: Props) {
  const { simulationType } = await params;

  const titles: { [key in SIMULATION_TYPE]: string } = {
    acpype: "Protein + Ligand (prepared in ACPYPE)",
    apo: "Free Protein (APO)",
  };

  return (
    <PageLayout>
      <Title>New {titles[simulationType]} Simulation</Title>
      <NewSimulationForm simulationType={simulationType} />
    </PageLayout>
  );
}
