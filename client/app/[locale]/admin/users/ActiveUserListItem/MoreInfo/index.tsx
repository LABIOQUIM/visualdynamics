"use client";
import { Info } from "lucide-react";

import { TreeItem } from "@/app/[locale]/admin/users/ActiveUserListItem/MoreInfo/TreeItem";
import { useDataTree } from "@/app/[locale]/admin/users/ActiveUserListItem/MoreInfo/useDataTree";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { useI18n } from "@/locales/client";

export function MoreInfo({ user }: PropsWithUser) {
  const { data } = useDataTree(user.username);
  const t = useI18n();

  const isPureTree = (x: any): x is PureTree => x?.type !== undefined;

  return (
    <Dialog
      title={t("admin.users.see-more.dialog.title", {
        username: user.username
      })}
      description={t("admin.users.see-more.dialog.description", {
        username: user.username
      })}
      Trigger={(props) => (
        <Button
          title={t("admin.users.see-more.title")}
          variant="grayscale"
          iconClassName="h-5 w-5"
          LeftIcon={Info}
          {...props}
        />
      )}
    >
      {!data || (!isPureTree(data) && data.status === "not-found") ? (
        <div>No user tree</div>
      ) : Object.keys(data).length > 1 ? (
        <TreeItem item={data as PureTree} />
      ) : null}
    </Dialog>
  );
}
