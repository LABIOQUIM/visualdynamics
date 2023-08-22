"use client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { getUsers, GetUsersProps, GetUsersReturnProps } from "./getUsers";

export function useUsers(
  { toTake, searchByIdentifier, page }: GetUsersProps,
  options?: UseQueryOptions<GetUsersReturnProps, unknown>
): UseQueryResult<GetUsersReturnProps, unknown> {
  return useQuery({
    queryKey: ["Users", searchByIdentifier, toTake, page],
    queryFn: () =>
      getUsers({
        page,
        searchByIdentifier,
        toTake
      }),
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 5,
    ...options
  });
}
