import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

export type GetUserRunningSimulationResult =
  | {
      info: {
        timestamp: string;
        molecule: string;
        type: "APO" | "ACPYPE" | "PRODRG";
        celeryId: string;
        folder: string;
      };
      steps: string[];
      log: string[];
      status: "running";
    }
  | {
      status: "queued";
      celeryId: string;
      folder: string;
    }
  | {
      status: "not-running" | "no-username";
    };

export async function getUserRunningSimulation(
  username: string
): Promise<GetUserRunningSimulationResult> {
  try {
    if (!username) {
      return {
        status: "no-username"
      };
    }

    const { data } = await api.get<GetUserRunningSimulationResult>("/run", {
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

export function useUserRunningSimulation(
  username: string,
  options?: UseQueryOptions<GetUserRunningSimulationResult, unknown>
): UseQueryResult<GetUserRunningSimulationResult, unknown> {
  return useQuery({
    queryKey: ["UserRunningSimulation", username],
    queryFn: () => getUserRunningSimulation(username),
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 5,
    ...options
  });
}
