import { Slash } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { Button } from "@app/components/Button";
import { api } from "@app/lib/api";

interface DynamicRunningAbortButtonProps {
  celeryId: string;
  disableAbortButton?: boolean;
  folder: string;
  refetch: () => void;
}

export function DynamicRunningAbortButton({
  celeryId,
  disableAbortButton,
  folder,
  refetch
}: DynamicRunningAbortButtonProps) {
  const { t } = useTranslation(["common"]);
  const router = useRouter();

  async function abortTask() {
    const formData = new FormData();

    formData.append("taskId", celeryId);
    formData.append("folder", folder);
    api
      .post("/run/abort", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(() => {
        if (refetch) {
          refetch();
        } else {
          router.push("/my-dynamics");
        }
      });
  }

  return (
    <Button
      className="w-fit bg-red-700 enabled:hover:bg-red-800"
      LeftIcon={Slash}
      disabled={disableAbortButton}
      onClick={abortTask}
    >
      {t("common:abort")}
    </Button>
  );
}
