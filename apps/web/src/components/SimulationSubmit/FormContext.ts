import { createFormContext } from "@mantine/form";

import type { allForceFields, boxTypes, waterModels } from "./constants";

export type SimulationSubmitFormValues = {
  type: SIMULATION_TYPE;
  filePDB: File;
  fileLigandITP?: File;
  fileLigandPDB?: File;
  forceField: keyof typeof allForceFields;
  waterModel: keyof typeof waterModels;
  boxType: keyof typeof boxTypes;
  boxDistance: string;
};

export const [
  SimulationSubmitFormProvider,
  useSimulationSubmitFormContext,
  useSimulationSubmitForm,
] = createFormContext<SimulationSubmitFormValues>();
