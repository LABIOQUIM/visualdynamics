import { User } from "@prisma/client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import axios from "axios";

export async function getActiveUsers(): Promise<User[]> {
  try {
    const { data } = await axios.get<User[]>("/api/users/active");

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useActiveUsers(
  options?: UseQueryOptions<User[], unknown>
): UseQueryResult<User[], unknown> {
  return useQuery({
    queryKey: ["ActiveUsers"],
    queryFn: () => getActiveUsers(),
    refetchInterval: 1000 * 60,
    ...options
  });
}
