import { AppSettings } from "@prisma/client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import axios from "axios";

export type GetAppSettingsResult = AppSettings;

export async function getAppSettings(): Promise<GetAppSettingsResult> {
  try {
    const { data } = await axios.get<GetAppSettingsResult>("/api/app/settings");

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useAppSettings(
  options?: UseQueryOptions<GetAppSettingsResult, unknown>
): UseQueryResult<GetAppSettingsResult, unknown> {
  return useQuery({
    queryKey: ["AppSettings"],
    queryFn: () => getAppSettings(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
