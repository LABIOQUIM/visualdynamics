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
        .delete("/api/users/block", {
          params: {
            userId: user.id
          }
        })
        .then(() =>
          toast(
            t("admin-users:un-block.success", {
              username: user.username
            }) as string,
            {
              type: "success"
            }
          )
        );
    } catch {
      toast(t("admin-users:un-block.error") as string, {
        type: "error"
      });
    }
  }

  return (
    <Dialog
      title={t("admin-users:un-block.title", {
        username: user.username
      })}
      description={t(
        user.deleted
          ? "admin-users:un-block.unblock"
          : "admin-users:un-block.block",
        {
          username: user.username
        }
      )}
      Trigger={(props) => (
        <StatusButton
          title={t("admin-users:un-block.title")}
          status="error"
          iconClassName="h-5 w-5"
          LeftIcon={UserX}
          {...props}
        />
      )}
      Submit={(props) => (
        <StatusButton
          title={t(
            user.deleted
              ? "admin-users:un-block.button-unblock"
              : "admin-users:un-block.button-block"
          )}
          status={user.deleted ? "finished" : "error"}
          iconClassName="h-5 w-5"
          onClickCapture={handleDisableUser}
          {...props}
        >
          {t(
            user.deleted
              ? "admin-users:un-block.button-unblock"
              : "admin-users:un-block.button-block"
          )}
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
