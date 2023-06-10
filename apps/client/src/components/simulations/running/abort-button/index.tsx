import { useState } from "react";
import { Slash } from "lucide-react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { Button } from "@app/components/general/buttons";
import { api } from "@app/lib/api";

interface SimulationAbortButtonProps {
  celeryId: string;
  disableAbortButton?: boolean;
  folder: string;
  refetch?: () => void;
}

export function SimulationAbortButton({
  celeryId,
  disableAbortButton,
  folder,
  refetch
}: SimulationAbortButtonProps) {
  const [isAborting, setIsAborting] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

  async function abortTask() {
    setIsAborting(true);
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
          router.push("/simulations");
        }
      })
      .finally(() => setIsAborting(false));
  }

  return (
    <Button
      className="w-fit bg-red-700 enabled:hover:bg-red-800"
      LeftIcon={Slash}
      disabled={disableAbortButton || isAborting}
      onClick={abortTask}
    >
      {t("common:abort")}
    </Button>
  );
}
