import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import axios from "axios";

export async function getAdminSignUpRequestList(): Promise<InactiveUser[]> {
  try {
    const { data } = await axios.get<InactiveUser[]>("/api/users/inactive");

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useAdminSignUpRequestList(
  options?: UseQueryOptions<InactiveUser[], unknown>
): UseQueryResult<InactiveUser[], unknown> {
  return useQuery({
    queryKey: ["AdminSignUpRequestList"],
    queryFn: () => getAdminSignUpRequestList(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
