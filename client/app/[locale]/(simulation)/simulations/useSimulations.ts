"use client";
import { Simulation } from "@prisma/client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { getSimulations } from "./getSimulations";

export function useSimulations(
  username: string,
  options?: UseQueryOptions<Simulation[] | undefined, unknown>
): UseQueryResult<Simulation[] | undefined, unknown> {
  return useQuery({
    queryFn: () => getSimulations(username),
    queryKey: ["SimulationList", username],
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 120,
    ...options
  });
}
