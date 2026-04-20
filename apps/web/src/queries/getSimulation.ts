import { queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";

export const fetchSimulation = async (simulationId: string) => {
  const api = await getAPIClient();

  return api
    .get<SimulationDetails>("/simulation", {
      params: {
        simulationId,
      },
    })
    .then((r) => r.data);
};

export const getSimulation = (simulationId: string) =>
  queryOptions({
    queryKey: QUERY_KEYS.simulation(simulationId),
    queryFn: () => fetchSimulation(simulationId),
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // 10 seconds
    refetchIntervalInBackground: false,
  });
