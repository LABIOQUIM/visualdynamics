import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

interface GetRunningDynamicResult {
  data?: {
    timestamp: string;
    molecule: string;
    type: "APO" | "ACPYPE";
  };
  step?: string;
  log?: string[];
  status: "running" | "not-running";
}

export async function getRunningDynamic(
  username: string
): Promise<GetRunningDynamicResult> {
  const { data } = await api.get<GetRunningDynamicResult>("/run", {
    params: {
      username
    }
  });

  return data;
}

export function useRunningDynamic(
  username: string,
  options?: UseQueryOptions<GetRunningDynamicResult, unknown>
): UseQueryResult<GetRunningDynamicResult, unknown> {
  return useQuery({
    queryKey: ["RunningDynamic", username],
    queryFn: () => getRunningDynamic(username),
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 5,
    ...options
  });
}
