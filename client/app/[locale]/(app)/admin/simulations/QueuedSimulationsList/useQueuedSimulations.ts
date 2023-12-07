"use client";

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { getQueuedSimulations } from "./getQueuedSimulations";

export function useQueuedSimulations(
  options?: UseQueryOptions<GetCelerySimulationsResult, unknown>
): UseQueryResult<GetCelerySimulationsResult, unknown> {
  return useQuery({
    queryKey: ["QueuedSimulations"],
    queryFn: () => getQueuedSimulations(),
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 5,
    ...options
  });
}
