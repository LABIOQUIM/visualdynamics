import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

export type GetListDynamicResult =
  | {
      dynamics: {
        timestamp: string;
        molecule: string;
        type: "APO" | "ACPYPE";
        celeryId: string;
        isRunning: boolean;
        status: "queued" | "canceled" | "finished" | "running" | "error";
        errored_command: string | null;
      }[];
      status: "listed";
    }
  | {
      status: "no-dynamics" | "no-username";
    };

export async function getListDynamics(
  username: string
): Promise<GetListDynamicResult> {
  try {
    if (!username) {
      return {
        status: "no-username"
      };
    }

    const { data } = await api.get<GetListDynamicResult>("/dynamics", {
      params: {
        username
      }
    });

    return data;
  } catch (err) {
    return {
      status: "no-dynamics"
    };
  }
}

export function useListDynamics(
  username: string,
  options?: UseQueryOptions<GetListDynamicResult, unknown>
): UseQueryResult<GetListDynamicResult, unknown> {
  return useQuery({
    queryKey: ["ListDynamics", username],
    queryFn: () => getListDynamics(username),
    ...options
  });
}
