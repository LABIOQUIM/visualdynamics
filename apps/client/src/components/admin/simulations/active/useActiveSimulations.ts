import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

export type GetActiveSimulationsResult = {
  [key: string]: {
    id: string;
    name: string;
    args: string[];
    type: string;
    time_start: number;
    acknowledged: boolean;
    worker_pid: number;
  }[];
};

export async function getActiveSimulations(): Promise<GetActiveSimulationsResult> {
  try {
    const { data } = await api.get<GetActiveSimulationsResult>(
      "/celery/active"
    );

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useActiveSimulations(
  options?: UseQueryOptions<GetActiveSimulationsResult, unknown>
): UseQueryResult<GetActiveSimulationsResult, unknown> {
  return useQuery({
    queryKey: ["ActiveSimulations"],
    queryFn: () => getActiveSimulations(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
