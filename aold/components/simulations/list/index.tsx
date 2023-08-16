import dynamic from "next/dynamic";

const Card = dynamic(
  () =>
    import("aold/components/simulations/list/item").then(
      (m) => m.SimulationListItem
    ),
  {
    ssr: false
  }
);

interface MySimulationsListProps {
  simulations: Simulation[];
}

export function MySimulationsList({ simulations }: MySimulationsListProps) {
  return (
    <div className="flex flex-col gap-y-1">
      {simulations.map((simulation) => (
        <Card
          simulation={simulation}
          key={simulation.celeryId}
        />
      ))}
    </div>
  );
}
