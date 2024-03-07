"use client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { fetchDataTree } from "@/app/[locale]/admin/users/ActiveUserListItem/MoreInfo/fetchDataTree";

export function useDataTree(
  username: string,
  options?: UseQueryOptions<Tree, unknown>
): UseQueryResult<Tree, unknown> {
  return useQuery({
    queryKey: ["UserDataTree", username],
    queryFn: () => fetchDataTree(username),
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 5,
    ...options
  });
}
