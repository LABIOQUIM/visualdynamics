import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import axios from "axios";

export async function getInactiveUsers(): Promise<InactiveUser[]> {
  try {
    const { data } = await axios.get<InactiveUser[]>("/api/users/inactive");

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useInactiveUsers(
  options?: UseQueryOptions<InactiveUser[], unknown>
): UseQueryResult<InactiveUser[], unknown> {
  return useQuery({
    queryKey: ["InactiveUsers"],
    queryFn: () => getInactiveUsers(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
