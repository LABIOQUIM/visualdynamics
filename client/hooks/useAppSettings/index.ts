import { AppSettings } from "@prisma/client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { getAppSettings } from "@/hooks/useAppSettings/getAppSettings";

export function useAppSettings(
  options?: UseQueryOptions<AppSettings, unknown>
): UseQueryResult<AppSettings, unknown> {
  return useQuery({
    queryKey: ["AppSettings"],
    queryFn: () => getAppSettings(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
