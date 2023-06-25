import { User } from "@prisma/client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";
import axios from "axios";

type Props = {
  users: User[];
  count: number;
};

export async function getActiveUsers(
  page: number,
  searchByIdentifier?: string
): Promise<Props> {
  try {
    const { data } = await axios.get<Props>("/api/users", {
      params: {
        page,
        searchByIdentifier
      }
    });

    return data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    throw new Error(e);
  }
}

export function useActiveUsers(
  page = 0,
  searchByIdentifier?: string,
  options?: UseQueryOptions<Props, unknown>
): UseQueryResult<Props, unknown> {
  return useQuery({
    queryKey: ["ActiveUsers", page, searchByIdentifier],
    queryFn: () => getActiveUsers(page, searchByIdentifier),
    refetchInterval: 1000 * 60,
    keepPreviousData: true,
    ...options
  });
}
