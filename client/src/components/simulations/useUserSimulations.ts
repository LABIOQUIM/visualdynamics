import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

export type GetUserSimulationsResult =
  | {
      simulations: Simulation[];
      status: "has-simulations";
    }
  | {
      status: "no-simulations" | "no-username";
    };

export async function getUserSimulations(
  username: string
): Promise<GetUserSimulationsResult> {
  try {
    if (!username) {
      return {
        status: "no-username"
      };
    }

    const { data } = await api.get<GetUserSimulationsResult>("/simulations", {
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

export function useUserSimulations(
  username: string,
  options?: UseQueryOptions<GetUserSimulationsResult, unknown>
): UseQueryResult<GetUserSimulationsResult, unknown> {
  return useQuery({
    queryKey: ["UserSimulations", username],
    queryFn: () => getUserSimulations(username),
    ...options
  });
}
