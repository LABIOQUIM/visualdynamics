import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

export type GetRunningDynamicResult =
  | {
      info: {
        timestamp: string;
        molecule: string;
        type: "APO" | "ACPYPE";
        celeryId: string;
      };
      steps: string[];
      log: string[];
      status: "running";
    }
  | {
      status: "not-running" | "no-username";
    };

export async function getRunningDynamic(
  username: string
): Promise<GetRunningDynamicResult> {
  try {
    if (!username) {
      return {
        status: "no-username"
      };
    }

    const { data } = await api.get<GetRunningDynamicResult>("/run", {
      params: {
        username
      }
    });

    return data;
  } catch (err) {
    console.log(err);
    return {
      status: "not-running"
    };
  }
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
