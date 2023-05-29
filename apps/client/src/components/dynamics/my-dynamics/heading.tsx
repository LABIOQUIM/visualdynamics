import { FileDown, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { Button } from "@app/components/general/buttons";
import { TextButton } from "@app/components/general/buttons/Text";
import { cnMerge } from "@app/utils/cnMerge";

interface MyDynamicsHeader {
  isRefetching?: boolean;
  isLoading?: boolean;
  refetch: () => void;
  timeUntilRefresh: number;
}

export function MyDynamicsHeader({
  refetch,
  timeUntilRefresh,
  isLoading,
  isRefetching
}: MyDynamicsHeader) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <Button
        LeftIcon={FileDown}
        onClick={() => router.push("/api/downloads/mdp")}
      >
        {t("my-dynamics:downloads.mdp")}
      </Button>
      <div className="flex flex-1">
        <TextButton
          iconClassName={cnMerge({
            "animate-spin": isRefetching || isLoading
          })}
          disabled={isRefetching || isLoading}
          LeftIcon={RefreshCw}
          onClick={() => refetch()}
        />
        <p className="my-auto ml-2 md:ml-auto">
          {t("my-dynamics:auto-refresh", { seconds: timeUntilRefresh })}
        </p>
      </div>
    </div>
  );
}
