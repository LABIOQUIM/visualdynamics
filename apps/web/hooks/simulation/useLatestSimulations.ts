import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import { getLatestSimulations } from "@/actions/simulation/getLatestSimulations";

type Return = Awaited<ReturnType<typeof getLatestSimulations>>;

export function useLatestSimulations(
  options?: UseQueryOptions<Return, unknown>
): UseQueryResult<Return, unknown> {
  return useQuery({
    queryKey: ["latest-simulations"],
    queryFn: () => getLatestSimulations(),
    ...options,
  });
}
