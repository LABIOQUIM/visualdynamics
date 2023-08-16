import { useState } from "react";
import { Info } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { TreeItem } from "aold/components/admin/users/management/list/item/tree-item";
import { StatusButton } from "aold/components/general/buttons/Status";
import { Dialog } from "aold/components/general/dialog";
import { api } from "../../../../../../lib/api";

export function MoreInfo({ user }: PropsWithUser) {
  const [userTree, setUserTree] = useState<Tree>({} as Tree);
  const { t } = useTranslation();

  const onOpenChange = (open: boolean) => {
    if (open) {
      api
        .get<Tree>("/simulations/tree", {
          params: {
            username: user.username
          }
        })
        .then((res) => setUserTree(res.data));
    }
  };

  return (
    <Dialog
      onOpenChange={onOpenChange}
      title={t("admin-users:see-more.dialog.title", {
        username: user.username
      })}
      description={t("admin-users:see-more.dialog.description", {
        username: user.username
      })}
      Trigger={(props) => (
        <StatusButton
          title={t("admin-users:see-more.title")}
          status="canceled"
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
