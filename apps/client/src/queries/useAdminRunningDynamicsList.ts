import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

export type GetAdminRunningDynamicsListResult = {
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

export async function getAdminRunningDynamicsList(): Promise<GetAdminRunningDynamicsListResult> {
  const { data } = await api.get<GetAdminRunningDynamicsListResult>(
    "/celery/active"
  );

  return data;
}

export function useAdminRunningDynamicsList(
  options?: UseQueryOptions<GetAdminRunningDynamicsListResult, unknown>
): UseQueryResult<GetAdminRunningDynamicsListResult, unknown> {
  return useQuery({
    queryKey: ["AdminRunningDynamicsList"],
    queryFn: () => getAdminRunningDynamicsList(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
