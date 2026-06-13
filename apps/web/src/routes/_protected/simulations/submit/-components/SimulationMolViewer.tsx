import { type Control, useWatch } from "react-hook-form";

import type { SimulationFormValues } from "./schema";
import { useSimulationViewer } from "./useSimulationViewer";

import { LazyMolViewer } from "@/components/LazyMolViewer";

interface Props {
  control: Control<SimulationFormValues>;
}

export function SimulationMolViewer({ control }: Props) {
  const filePDB = useWatch({ control, name: "filePDB" });
  const ligands = useWatch({ control, name: "ligands" });
  const files = useSimulationViewer(filePDB, ligands);

  return <LazyMolViewer macromolecules={files} />;
}
