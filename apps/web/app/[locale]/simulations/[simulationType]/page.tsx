import { Title } from "@mantine/core";

import { PageLayout } from "@/components/Layout/PageLayout";
import { NewSimulationForm } from "@/components/NewSimulationForm";

interface Props {
  params: {
    simulationType: SimulationType;
  };
}

export default function Page({ params }: Props) {
  return (
    <PageLayout>
      <Title>New {params.simulationType.toUpperCase()} Simulation</Title>
      <NewSimulationForm simulationType={params.simulationType} />
    </PageLayout>
  );
}
