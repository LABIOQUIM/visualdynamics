import { getAPIClient } from "@/lib/api";

export async function cancelSimulation(simulationId: string) {
  const api = await getAPIClient();
  return api
    .post<{ status: string }>(`/simulation/cancel/${simulationId}`, {})
    .then((r) => r.data);
}
