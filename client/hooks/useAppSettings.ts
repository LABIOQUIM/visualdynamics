import { AppSettings } from "@prisma/client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import axios from "axios";

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const { data } = await axios.get<AppSettings>("/api/app/settings");

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

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
