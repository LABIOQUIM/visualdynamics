import { toast } from "react-toastify";
import axios from "axios";
import { UserX } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { StatusButton } from "@app/components/general/buttons/Status";
import { Dialog } from "@app/components/general/dialog";

export function DisableUser({ user }: PropsWithUser) {
  const { t } = useTranslation();

  async function handleDisableUser() {
    try {
      axios
        .delete("/api/users/delete", {
          params: {
            userId: user.id
          }
        })
        .then(() =>
          toast(
            t("admin-users:delete.success", {
              username: user.username
            }) as string,
            {
              type: "success"
            }
          )
        );
    } catch {
      toast(t("admin-users:delete.error") as string, {
        type: "error"
      });
    }
  }

  return (
    <Dialog
      title={t("admin-users:delete.title", {
        username: user.username
      })}
      description={t("admin-users:delete.description", {
        username: user.username
      })}
      Trigger={(props) => (
        <StatusButton
          title={t("admin-users:delete.title")}
          status="error"
          disabled={user.deleted ?? false}
          iconClassName="h-5 w-5"
          LeftIcon={UserX}
          {...props}
        />
      )}
      Submit={(props) => (
        <StatusButton
          title={t("admin-users:delete.title")}
          status="error"
          iconClassName="h-5 w-5"
          onClickCapture={handleDisableUser}
          {...props}
        >
          {t("admin-users:delete.title")}
        </StatusButton>
      )}
      Cancel={(props) => (
        <StatusButton
          title={t("common:cancel")}
          status="canceled"
          iconClassName="h-5 w-5"
          {...props}
        >
          {t("common:cancel")}
        </StatusButton>
      )}
    />
  );
}
