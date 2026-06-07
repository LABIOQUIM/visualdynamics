import { getAPIClient } from "@/lib/api";

export type UpdateSimulationInput = {
  moleculeName?: string | undefined;
  type?: SIMULATION_TYPE | undefined;
  status?: SIMULATION_STATUS | undefined;
  errorCause?: string | null | undefined;
};

export async function updateSimulation(
  simulationId: string,
  data: UpdateSimulationInput,
) {
  const api = await getAPIClient();
  return api
    .patch(`/simulation/update/${simulationId}`, data)
    .then((r) => r.data);
}
