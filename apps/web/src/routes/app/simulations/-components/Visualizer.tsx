import { useQuery } from "@tanstack/react-query";

import { Loader } from "@/components/Loader";
import { ThreeDViewer } from "@/components/ThreeDViewer/ThreeDViewer";
import { getSimulation } from "@/queries/getSimulation";

type VisualizerProps = {
  simulationId: string;
};

export function Visualizer({ simulationId }: VisualizerProps) {
  const { data } = useQuery(getSimulation(simulationId));

  if (!data) {
    return <Loader />;
  }

  if (data.molecules.macromolecule === null) {
    return <div>No macromolecule found.</div>;
  }

  return (
    <ThreeDViewer
      macromolecules={{
        macromolecule: data.molecules.macromolecule,
        ligandPdb: data.molecules.ligand,
      }}
    />
  );
}
