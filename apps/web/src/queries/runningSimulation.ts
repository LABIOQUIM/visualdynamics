import { queryOptions } from "@tanstack/react-query";

import { getAPIClient } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";

export type RunningSimulation =
  | {
      status: "running";
      logData: string[];
      stepData: string[];
      submissionInfo: Partial<Simulation>;
    }
  | { status: "not-running" }
  | { status: "queued"; position: number };

export const fetchRunningSimulation = async (simulationId: string) => {
  const api = await getAPIClient();

  return api
    .get<RunningSimulation>("/simulation", {
      params: {
        id: simulationId,
      },
    })
    .then((r) => r.data);
};

export const runningSimulationQuery = (simulationId: string) =>
  queryOptions({
    queryKey: QUERY_KEYS.runningSimulation(simulationId),
    queryFn: () => fetchRunningSimulation(simulationId),
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // 10 seconds
    refetchIntervalInBackground: false,
  });
