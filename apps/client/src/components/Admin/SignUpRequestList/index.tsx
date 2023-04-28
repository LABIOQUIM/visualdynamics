import { Check, Users, X } from "lucide-react";
import { useTranslation } from "next-i18next";

import { StatusButton } from "@app/components/Button/Status";

interface AdminSignUpRequestListProps {
  inactiveUsers?: InactiveUser[];
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
}

export function AdminSignUpRequestList({
  inactiveUsers,
  approveUser,
  rejectUser
}: AdminSignUpRequestListProps) {
  const { t } = useTranslation(["admin-signup"]);

  if (inactiveUsers && inactiveUsers.length > 0) {
    return (
      <ol className="flex flex-col gap-2">
        {inactiveUsers.map((user) => (
          <li
            className="flex flex-col items-center justify-between gap-3 rounded-lg p-4 odd:bg-zinc-500/20 even:bg-zinc-500/10 md:flex-row"
            key={user.id}
          >
            <div className="flex flex-col">
              <p>{user.username}</p>
              <p>{user.email}</p>
            </div>
            <div className="flex gap-x-2">
              <StatusButton
                status="finished"
                LeftIcon={Check}
                onClick={() => approveUser(user.id)}
              >
                {t("admin-signup:approve")}
              </StatusButton>
              <StatusButton
                status="error"
                LeftIcon={X}
                onClick={() => rejectUser(user.id)}
              >
                {t("admin-signup:reject")}
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
      <p>{t("admin-signup:empty")}</p>
    </div>
  );
}
