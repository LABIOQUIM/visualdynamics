"use client";

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { getMDPSettings } from "./getMDPSettings";

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
