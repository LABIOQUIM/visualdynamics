import { FileDown, RefreshCw } from "lucide-react";
import NextLink from "next/link";
import useTranslation from "next-translate/useTranslation";

import { Button } from "aold/components/general/buttons";
import { TextButton } from "aold/components/general/buttons/Text";
import { cnMerge } from "../../utils/cnMerge";

interface MyDynamicsHeader {
  isRefetching?: boolean;
  isLoading?: boolean;
  refetch: () => void;
  timeUntilRefresh: number;
}

export function MySimulationsHeader({
  refetch,
  timeUntilRefresh,
  isLoading,
  isRefetching
}: MyDynamicsHeader) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <NextLink
        href="/api/downloads/mdp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button LeftIcon={FileDown}>{t("simulations:downloads.mdp")}</Button>
      </NextLink>
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
          {t("simulations:auto-refresh", { seconds: timeUntilRefresh })}
        </p>
      </div>
    </div>
  );
}
