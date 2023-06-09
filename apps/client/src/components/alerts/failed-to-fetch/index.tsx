import { Laptop2, ServerOff } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { H2 } from "@app/components/general/typography/headings";
import { LoadingThreeDotsWave } from "@app/components/Loading/ThreeDotsWave";

export function AlertFailedToFetch() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex items-center gap-x-1 text-primary-600 dark:text-primary-400">
        <Laptop2 className="h-10 w-10" />
        <LoadingThreeDotsWave />
        <ServerOff className="h-10 w-10" />
      </div>
      <H2>{t("common:errors.failed-to-fetch")}</H2>
    </div>
  );
}
