import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { TreeItem } from "@app/components/admin/users/management/list/item/tree-item";
import { StatusButton } from "@app/components/general/buttons/Status";
import { Dialog } from "@app/components/general/dialog";
import { api } from "@app/lib/api";

export function MoreInfo({ user }: PropsWithUser) {
  const [userTree, setUserTree] = useState<Tree>({} as Tree);
  const { t } = useTranslation();

  useEffect(() => {
    api
      .get<Tree>("/simulations/tree", {
        params: {
          username: user.username
        }
      })
      .then((res) => setUserTree(res.data));
  }, [user]);

  return (
    <Dialog
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
      {Object.keys(userTree).length > 1 ? <TreeItem item={userTree} /> : null}
    </Dialog>
  );
}
