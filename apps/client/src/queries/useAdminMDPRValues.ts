import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { api } from "@app/lib/api";

export type GetAdminMDPRValuesResult =
  | {
      status: "not-found";
    }
  | {
      status: "found";
      nsteps: number;
      dt: number;
    };

export async function getAdminMDPRValues(): Promise<GetAdminMDPRValuesResult> {
  const { data } = await api.get<GetAdminMDPRValuesResult>("/mdpr");

  return data;
}

export function useAdminMDPRValues(
  options?: UseQueryOptions<GetAdminMDPRValuesResult, unknown>
): UseQueryResult<GetAdminMDPRValuesResult, unknown> {
  return useQuery({
    queryKey: ["AdminMDPRValues"],
    queryFn: () => getAdminMDPRValues(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
