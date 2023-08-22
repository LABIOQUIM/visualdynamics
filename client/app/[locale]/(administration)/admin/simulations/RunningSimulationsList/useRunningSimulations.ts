"use client";

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { getRunningSimulations } from "./getRunningSimulations";

export function useRunningSimulations(
  options?: UseQueryOptions<GetCelerySimulationsResult, unknown>
): UseQueryResult<GetCelerySimulationsResult, unknown> {
  return useQuery({
    queryKey: ["RunningSimulations"],
    queryFn: () => getRunningSimulations(),
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 5,
    ...options
  });
}
