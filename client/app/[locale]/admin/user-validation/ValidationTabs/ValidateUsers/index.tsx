"use client";

import { ValidationList } from "@/app/[locale]/admin/user-validation/ValidationList";
import { approveUser } from "@/app/[locale]/admin/user-validation/ValidationTabs/approveUser";
import { rejectUser } from "@/app/[locale]/admin/user-validation/ValidationTabs/rejectUser";
import { useInactiveUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/ValidateUsers/useInactiveUsers";
import { useUsers } from "@/app/[locale]/admin/users/useUsers";

export function ValidateUsers() {
  const { data, refetch } = useInactiveUsers();
  const { refetch: refetchUsers } = useUsers({
    page: 1,
    toTake: 20,
    searchByIdentifier: ""
  });
  function approve(userId: string) {
    approveUser(userId);
    refetch();
    refetchUsers();
  }

  function reject(userId: string) {
    rejectUser(userId);
    refetch();
  }

  return (
    <ValidationList
      users={data}
      approve={approve}
      reject={reject}
    />
  );
}
