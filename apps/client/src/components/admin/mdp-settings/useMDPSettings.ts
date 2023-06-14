import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

export type GetMDPSettingsResult =
  | {
      status: "not-found";
    }
  | {
      status: "found";
      nsteps: number;
      dt: number;
    };

export async function getMDPSettings(): Promise<GetMDPSettingsResult> {
  try {
    const { data } = await api.get<GetMDPSettingsResult>("/mdpr");

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useMDPSettings(
  options?: UseQueryOptions<GetMDPSettingsResult, unknown>
): UseQueryResult<GetMDPSettingsResult, unknown> {
  return useQuery({
    queryKey: ["MDPSettings"],
    queryFn: () => getMDPSettings(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
