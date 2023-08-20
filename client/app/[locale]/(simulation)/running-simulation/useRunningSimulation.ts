"use client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import {
  getRunningSimulation,
  GetRunningSimulationResult
} from "./getRunningSimulation";

export function useRunningSimulation(
  username: string,
  options?: UseQueryOptions<GetRunningSimulationResult, unknown>
): UseQueryResult<GetRunningSimulationResult, unknown> {
  return useQuery({
    queryKey: ["RunningSimulation", username],
    queryFn: () => getRunningSimulation(username),
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 5,
    ...options
  });
}
