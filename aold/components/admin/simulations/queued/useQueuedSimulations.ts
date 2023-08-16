import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "../../../../lib/api";

export type GetQueuedSimulationsResult = {
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

export async function getQueuedSimulations(): Promise<GetQueuedSimulationsResult> {
  try {
    const { data } = await api.get<GetQueuedSimulationsResult>(
      "/celery/queued"
    );

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useQueuedSimulations(
  options?: UseQueryOptions<GetQueuedSimulationsResult, unknown>
): UseQueryResult<GetQueuedSimulationsResult, unknown> {
  return useQuery({
    queryKey: ["QueuedSimulations"],
    queryFn: () => getQueuedSimulations(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
