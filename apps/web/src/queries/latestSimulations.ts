import { queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";

export type LatestSimulations = {
  [key in SIMULATION_TYPE]: Simulation | null;
};

export const fetchLatestSimulations = async () => {
  const api = await getAPIClient();

  return api.get<LatestSimulations>("/simulation/latest").then((r) => r.data);
};

export const latestSimulationsQuery = queryOptions({
  queryKey: ["latest-simulations"],
  queryFn: () => fetchLatestSimulations(),
});
