import { getAPIClient } from "@/lib/api";

export async function retrySimulation(simulationId: string) {
  const api = await getAPIClient();
  return api
    .post<{ status: string }>(`/simulation/admin/retry/${simulationId}`, {})
    .then((r) => r.data);
}
