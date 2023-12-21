"use client";

import { ValidationList } from "@/app/[locale]/admin/user-validation/ValidationList";
import { approveUser } from "@/app/[locale]/admin/user-validation/ValidationTabs/approveUser";
import { useRejectedUsers } from "@/app/[locale]/admin/user-validation/ValidationTabs/RevalidateUsers/useRejectedUsers";

export function RevalidateUsers() {
  const { data, refetch } = useRejectedUsers();

  function approve(userId: string) {
    approveUser(userId);
    refetch();
  }

  return (
    <ValidationList
      users={data}
      approve={approve}
    />
  );
}
