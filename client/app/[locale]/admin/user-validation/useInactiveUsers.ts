"use client";
import { User } from "@prisma/client";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult
} from "@tanstack/react-query";

import { getValidationUsers } from "@/app/[locale]/admin/user-validation/getValidationUsers";

export function useInactiveUsers(
  options?: UseQueryOptions<Omit<User, "password">[], unknown>
): UseQueryResult<Omit<User, "password">[], unknown> {
  return useQuery({
    queryFn: () => getValidationUsers(),
    queryKey: ["InactiveUsersList"],
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 120,
    ...options
  });
}
