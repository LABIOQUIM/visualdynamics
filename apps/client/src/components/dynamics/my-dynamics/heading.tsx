import { Archive, FileDown, RefreshCw } from "lucide-react";
import NextLink from "next/link";
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

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <NextLink
        href="/api/downloads/mdp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button LeftIcon={FileDown}>{t("my-dynamics:downloads.mdp")}</Button>
      </NextLink>
      <NextLink
        href="/api/downloads/archive"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          LeftIcon={Archive}
          title={t("my-dynamics:downloads.archive-info")}
        >
          {t("my-dynamics:downloads.archive")}
        </Button>
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
          {t("my-dynamics:auto-refresh", { seconds: timeUntilRefresh })}
        </p>
      </div>
    </div>
  );
}
