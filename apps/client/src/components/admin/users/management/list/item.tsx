import { toast } from "react-toastify";
import { User } from "@prisma/client";
import { Crown, FolderX, Info, Pen } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { StatusButton } from "@app/components/general/buttons/Status";
import { H2 } from "@app/components/general/typography/headings";
import { ParagraphSmall } from "@app/components/general/typography/paragraphs";
import { api } from "@app/lib/api";

interface ActiveUserListItem {
  user: User;
}

export function ActiveUserListItem({ user }: ActiveUserListItem) {
  const { t } = useTranslation();

  async function handleCleanUserFolder() {
    try {
      const data = new FormData();
      data.append("username", user.username);
      await api.post("/simulations/clean", data).then(() =>
        toast(
          t("admin-users:clean.success", { username: user.username }) as string,
          {
            type: "success"
          }
        )
      );
    } catch {
      toast(t("admin-users:clean.error") as string, {
        type: "error"
      });
    }
  }

  return (
    <li className="flex h-24 items-center justify-between gap-4 rounded-lg border border-primary-400 bg-primary-500/20 p-4 dark:border-primary-900 dark:bg-primary-500/5">
      <div>
        <H2 className="inline-flex gap-2">
          {user.role === "ADMIN" ? <Crown /> : null}
          {user.name}
        </H2>
        <ParagraphSmall>
          {user.username} &bull; {user.email}
        </ParagraphSmall>
      </div>
      <div className="flex gap-1">
        <StatusButton
          title={t("admin-users:see-more.title")}
          status="canceled"
          disabled
          iconClassName="h-5 w-5"
          LeftIcon={Info}
        />
        <StatusButton
          title={t("admin-users:edit.title")}
          status="running"
          disabled
          iconClassName="h-5 w-5"
          LeftIcon={Pen}
        />
        <StatusButton
          title={t("admin-users:clean.title")}
          status="error"
          iconClassName="h-5 w-5"
          LeftIcon={FolderX}
          onClick={handleCleanUserFolder}
        />
      </div>
    </li>
  );
}
