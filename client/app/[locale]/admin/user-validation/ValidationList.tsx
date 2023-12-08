import { User } from "@prisma/client";
import { Check, Users, X } from "lucide-react";

import { Button } from "@/components/Button";
import { useI18n } from "@/locales/client";

type Props = {
  users?: Omit<User, "password">[];
  approve: (userId: string, userEmail: string, deleted?: boolean) => void;
  reject: (userId: string, userEmail: string) => void;
};

export function ValidationList({ approve, reject, users }: Props) {
  const t = useI18n();

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <Users className="h-14 w-14" />
        <p>{t("admin.validation.empty")}</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {users.map((user) => (
        <li
          className="flex flex-col gap-3 rounded-lg p-4 odd:bg-zinc-500/20 even:bg-zinc-500/10 md:flex-row lg:items-center lg:justify-between"
          key={user.id}
        >
          <div className="flex flex-col">
            <p className="font-bold">{user.username}</p>
            <p className="font-light">{user.email}</p>
          </div>
          <div className="flex gap-x-2">
            <Button
              variant="success"
              LeftIcon={Check}
              onClick={() =>
                approve(user.id, user.email, user.deleted ?? false)
              }
            >
              {t("admin.validation.approve")}
            </Button>
            <Button
              variant="danger"
              disabled={user.deleted ?? false}
              LeftIcon={X}
              onClick={() => reject(user.id, user.email)}
            >
              {t("admin.validation.reject")}
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
}
