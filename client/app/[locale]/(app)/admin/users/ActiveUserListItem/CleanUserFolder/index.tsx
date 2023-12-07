import { toast } from "react-toastify";
import { FolderX } from "lucide-react";

import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { useI18n } from "@/locales/client";

import { cleanUserFolder } from "./cleanUserFolder";

export function CleanUserFolder({ user }: PropsWithUser) {
  const t = useI18n();

  return (
    <Dialog
      title={t("admin.users.clean.title")}
      description={t("admin.users.clean.description", {
        username: user.username
      })}
      Trigger={(props) => (
        <Button
          title={t("admin.users.clean.title")}
          variant="warning"
          iconClassName="h-5 w-5"
          LeftIcon={FolderX}
          {...props}
        />
      )}
      Submit={(props) => (
        <Button
          title={t("admin.users.clean.title")}
          variant="danger"
          iconClassName="h-5 w-5"
          onClickCapture={() =>
            cleanUserFolder(user.username).then(() =>
              toast(
                t("admin.users.clean.success", { username: user.username }),
                {
                  type: "success"
                }
              )
            )
          }
          {...props}
        >
          {t("admin.users.clean.title")}
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
