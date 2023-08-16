import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import axios from "axios";

export async function getRejectedUsers(): Promise<InactiveUser[]> {
  try {
    const { data } = await axios.get<InactiveUser[]>("/api/users/rejected");

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useRejectedUsers(
  options?: UseQueryOptions<InactiveUser[], unknown>
): UseQueryResult<InactiveUser[], unknown> {
  return useQuery({
    queryKey: ["RejectedUsers"],
    queryFn: () => getRejectedUsers(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
