import { Check, Users, X } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { StatusButton } from "aold/components/general/buttons/Status";

interface UserValidationListProps {
  inactiveUsers?: InactiveUser[];
  approveUser: (userId: string, userEmail: string, deleted?: boolean) => void;
  rejectUser: (userId: string, userEmail: string) => void;
}

export function UserValidationList({
  inactiveUsers,
  approveUser,
  rejectUser
}: UserValidationListProps) {
  const { t } = useTranslation();

  if (inactiveUsers && inactiveUsers.length > 0) {
    return (
      <ol className="flex flex-col gap-2">
        {inactiveUsers.map((user) => (
          <li
            className="flex flex-col gap-3 rounded-lg p-4 odd:bg-zinc-500/20 even:bg-zinc-500/10 md:flex-row lg:items-center lg:justify-between"
            key={user.id}
          >
            <div className="flex flex-col">
              <p className="font-bold">{user.username}</p>
              <p className="font-light">{user.email}</p>
            </div>
            <div className="flex gap-x-2">
              <StatusButton
                status="finished"
                LeftIcon={Check}
                onClick={() => approveUser(user.id, user.email, user.deleted)}
              >
                {t("admin-user-validation:approve")}
              </StatusButton>
              <StatusButton
                status="error"
                disabled={user.deleted}
                LeftIcon={X}
                onClick={() => rejectUser(user.id, user.email)}
              >
                {t("admin-user-validation:reject")}
              </StatusButton>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <Users className="h-14 w-14" />
      <p>{t("admin-user-validation:empty")}</p>
    </div>
  );
}
