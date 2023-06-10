import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

export type GetMDConfigResult =
  | {
      status: "not-found";
    }
  | {
      status: "found";
      nsteps: number;
      dt: number;
    };

export async function getMDConfig(): Promise<GetMDConfigResult> {
  try {
    const { data } = await api.get<GetMDConfigResult>("/mdpr");

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useMDConfig(
  options?: UseQueryOptions<GetMDConfigResult, unknown>
): UseQueryResult<GetMDConfigResult, unknown> {
  return useQuery({
    queryKey: ["MDConfig"],
    queryFn: () => getMDConfig(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
