import { useState } from "react";
import { Info } from "lucide-react";

import { fetchDataTree } from "@/app/[locale]/admin/users/ActiveUserListItem/MoreInfo/fetchDataTree";
import { TreeItem } from "@/app/[locale]/admin/users/ActiveUserListItem/MoreInfo/TreeItem";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { useI18n } from "@/locales/client";

export function MoreInfo({ user }: PropsWithUser) {
  const [userTree, setUserTree] = useState<Tree>({} as Tree);
  const t = useI18n();

  const onOpenChange = (open: boolean) => {
    if (open) {
      fetchDataTree(user.username).then((res) => setUserTree(res));
    }
  };

  return (
    <Dialog
      onOpenChange={onOpenChange}
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
      {/* @ts-ignore */}
      {userTree.status === "not-found" ? (
        <div>No user tree</div>
      ) : Object.keys(userTree).length > 1 ? (
        <TreeItem item={userTree as PureTree} />
      ) : null}
    </Dialog>
  );
}
