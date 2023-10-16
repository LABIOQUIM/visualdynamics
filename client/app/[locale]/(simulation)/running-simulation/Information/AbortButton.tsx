"use client";
import { useState } from "react";
import { StopCircle } from "lucide-react";

import { Button } from "@/components/Button";
import { useI18n } from "@/locales/client";

type Props = {
  taskId: string;
  folder: string;
  abortSimulation(taskId: string, folder: string): Promise<any>;
};

export function AbortButton({ abortSimulation, folder, taskId }: Props) {
  const t = useI18n();
  const [isDisabled, setIsDisabled] = useState(false);

  async function handleAbortSimulation() {
    setIsDisabled(true);
    await abortSimulation(taskId, folder);
    // TODO: Show corresponding toast for success or failure

    setIsDisabled(false);
  }

  return (
    <Button
      className="h-fit"
      disabled={isDisabled}
      LeftIcon={StopCircle}
      onClick={handleAbortSimulation}
      variant="danger"
    >
      {t("running-simulation.abort")}
    </Button>
  );
}
