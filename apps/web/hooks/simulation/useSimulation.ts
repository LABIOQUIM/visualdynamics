import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import { getSimulation } from "@/actions/simulation/getSimulation";

type Return = Awaited<ReturnType<typeof getSimulation>>;

export function useSimulation(
  simulationId: string,
  options?: UseQueryOptions<Return, unknown>
): UseQueryResult<Return, unknown> {
  return useQuery({
    queryKey: ["simulation", simulationId],
    queryFn: () => getSimulation(simulationId),
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // 10 seconds
    refetchIntervalInBackground: true,
    ...options,
  });
}
