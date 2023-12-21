"use client";

import { ValidationList } from "@/app/[locale]/admin/user-validation/ValidationList";
import { approveUser } from "@/app/[locale]/admin/user-validation/ValidationTabs/approveUser";
import { rejectUser } from "@/app/[locale]/admin/user-validation/ValidationTabs/rejectUser";
import { useInactiveUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/ValidateUsers/useInactiveUsers";

export function ValidateUsers() {
  const { data, refetch } = useInactiveUsers();

  function approve(userId: string) {
    approveUser(userId);
    refetch();
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
