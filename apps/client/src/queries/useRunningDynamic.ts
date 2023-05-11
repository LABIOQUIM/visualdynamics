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
        folder: string;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
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
