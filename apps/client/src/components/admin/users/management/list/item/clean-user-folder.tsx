import { toast } from "react-toastify";
import { FolderX } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { StatusButton } from "@app/components/general/buttons/Status";
import { Dialog } from "@app/components/general/dialog";
import { api } from "@app/lib/api";

export function CleanUserFolder({ user }: PropsWithUser) {
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
    <Dialog
      title={t("admin-users:clean.title", {
        username: user.username
      })}
      description={t("admin-users:clean.description", {
        username: user.username
      })}
      Trigger={(props) => (
        <StatusButton
          title={t("admin-users:clean.title")}
          status="queued"
          iconClassName="h-5 w-5"
          LeftIcon={FolderX}
          {...props}
        />
      )}
      Submit={(props) => (
        <StatusButton
          title={t("admin-users:clean.title")}
          status="error"
          iconClassName="h-5 w-5"
          onClickCapture={handleCleanUserFolder}
          {...props}
        >
          {t("admin-users:clean.title")}
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
