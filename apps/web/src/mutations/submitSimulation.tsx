import { getAPIClient } from "@/lib/api";
import type { SimulationFormValues } from "@/routes/_protected/submit/-components/schema";

export async function submitSimulation(
  values: SimulationFormValues,
  shouldRun?: boolean,
) {
  const data = new FormData();
  data.append("type", values.type);
  data.append("filePDB", values.filePDB);
  if (values.type !== "apo" && values.ligands) {
    for (const ligand of values.ligands) {
      data.append("fileLigandITP", ligand.fileITP);
      data.append("fileLigandPDB", ligand.filePDB);
    }
  }
  data.append("forceField", values.forceField);
  data.append("waterModel", values.waterModel);
  data.append("boxType", values.boxType);
  data.append("boxDistance", String(values.boxDistance));

  if (shouldRun) {
    data.append("shouldRun", "true");
    data.append("successEmail", "ended success");
    data.append("errorEmail", "ended fail");
  }

  const api = await getAPIClient();

  return api.post<
    | { status: "added-to-queue"; simulationId: string }
    | { status: "generated"; commands: string[] }
  >("/simulation/submit", data);
}
