import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { SIMULATION_TYPE } from "database";

import { getLatestSimulationMacromolecules } from "@/actions/simulation/getLatestSimulationMacromolecules";

type Return = Awaited<ReturnType<typeof getLatestSimulationMacromolecules>>;

export function useLatestSimulationMacromolecules(
  type: SIMULATION_TYPE,
  options?: UseQueryOptions<Return, unknown>
): UseQueryResult<Return, unknown> {
  return useQuery({
    queryKey: ["latest-simulation-macromolecules", type],
    queryFn: () => getLatestSimulationMacromolecules(type),
    ...options,
  });
}
