"use client";
import { useState } from "react";

import { useInactiveUsers } from "@/app/[locale]/(administration)/admin/user-validation/useInactiveUsers";
import { useRejectedUsers } from "@/app/[locale]/(administration)/admin/user-validation/useRejectedUsers";
import { ValidationList } from "@/app/[locale]/(administration)/admin/user-validation/ValidationList";
import { Switch } from "@/components/Forms/Switch";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H1 } from "@/components/Typography";
import { useI18n } from "@/locales/client";

type Props = {
  rejectUser: (userId: string) => Promise<any>;
  approveUser: (userId: string) => Promise<any>;
};

export function Validation({ approveUser, rejectUser }: Props) {
  const [isRejectedUserList, setIsRejectedUserList] = useState(false);
  const {
    data: inactiveUsers,
    isLoading: isLoadingInactiveUsers,
    isRefetching: isRefetchingInactiveUsers,
    refetch: refetchInactiveUsers
  } = useInactiveUsers();
  const {
    data: rejectedUsers,
    isLoading: isLoadingRejectedUsers,
    isRefetching: isRefetchingRejectedUsers,
    refetch: refetchRejectedUsers
  } = useRejectedUsers();
  const t = useI18n();

  return (
    <>
      <div className="flex gap-x-2">
        <H1 className="uppercase">{t("admin.validation.title")}</H1>
        {isLoadingInactiveUsers ||
        isRefetchingInactiveUsers ||
        isLoadingRejectedUsers ||
        isRefetchingRejectedUsers ? (
          <Spinner />
        ) : null}
      </div>
      <Switch
        name="show-rejected"
        onCheckedChange={setIsRejectedUserList}
        checked={isRejectedUserList}
        label={t("admin.validation.show-rejected-users")}
      />
      {!isRejectedUserList ? (
        isLoadingInactiveUsers ? (
          <Spinner />
        ) : !inactiveUsers ? (
          <Spinner />
        ) : (
          <ValidationList
            users={inactiveUsers}
            approve={(userId: string) => {
              approveUser(userId);
              refetchInactiveUsers();
            }}
            reject={(userId: string) => {
              rejectUser(userId);
              refetchInactiveUsers();
            }}
          />
        )
      ) : isLoadingRejectedUsers ? (
        <Spinner />
      ) : !rejectedUsers ? (
        <Spinner />
      ) : (
        <ValidationList
          users={rejectedUsers}
          approve={(userId: string) => {
            approveUser(userId);
            refetchInactiveUsers();
          }}
          reject={(userId: string) => {
            rejectUser(userId);
            refetchRejectedUsers();
          }}
        />
      )}
    </>
  );
}
