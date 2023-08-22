import { toast } from "react-toastify";
import axios from "axios";
import { UserX } from "lucide-react";

import { toggleSuspend } from "@/app/[locale]/(administration)/admin/users/ActiveUserListItem/ToggleSuspend/toggleSuspend";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { useI18n } from "@/locales/client";

export function ToggleSuspend({ user }: PropsWithUser) {
  const t = useI18n();

  return (
    <Dialog
      title={t("admin.users.un-block.title")}
      description={t(
        user.deleted
          ? "admin.users.un-block.unblock"
          : "admin.users.un-block.block",
        {
          username: user.username
        }
      )}
      Trigger={(props) => (
        <Button
          title={t("admin.users.un-block.title")}
          variant="danger"
          iconClassName="h-5 w-5"
          LeftIcon={UserX}
          {...props}
        />
      )}
      Submit={(props) => (
        <Button
          title={t(
            user.deleted
              ? "admin.users.un-block.button-unblock"
              : "admin.users.un-block.button-block"
          )}
          variant={user.deleted ? "success" : "danger"}
          iconClassName="h-5 w-5"
          onClickCapture={() =>
            toggleSuspend(user.id, user.deleted ?? false).then(() =>
              toast(
                t("admin.users.un-block.success", {
                  username: user.username
                }),
                {
                  type: "success"
                }
              )
            )
          }
          {...props}
        >
          {t(
            user.deleted
              ? "admin.users.un-block.button-unblock"
              : "admin.users.un-block.button-block"
          )}
        </Button>
      )}
      Cancel={(props) => (
        <Button
          title={t("common.cancel")}
          variant="grayscale"
          iconClassName="h-5 w-5"
          {...props}
        >
          {t("common.cancel")}
        </Button>
      )}
    />
  );
}
