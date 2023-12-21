"use client";
import { User } from "@prisma/client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { getValidationUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/getValidationUsers";

export function useRejectedUsers(
  options?: UseQueryOptions<Omit<User, "password">[], unknown>
): UseQueryResult<Omit<User, "password">[], unknown> {
  return useQuery({
    queryFn: () => getValidationUsers("rejected"),
    queryKey: ["RejectedUsersList"],
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 120,
    ...options
  });
}
