import { FileDown, RefreshCw } from "lucide-react";
import NextLink from "next/link";
import Trans from "next-translate/Trans";
import useTranslation from "next-translate/useTranslation";

import { AlertBox } from "@app/components/general/alert-box";
import { Button } from "@app/components/general/buttons";
import { TextButton } from "@app/components/general/buttons/Text";
import { cnMerge } from "@app/utils/cnMerge";

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
    <>
      <AlertBox status="warning">{t("simulations:disclaimer")}</AlertBox>
      <AlertBox status="warning">
        <Trans
          i18nKey="simulations:downloads.archive"
          components={{
            Link: (
              <NextLink
                className="text-yellow-950 dark:text-yellow-100"
                href="mailto:fernando.zanchi@fiocruz.br"
                target="_blank"
                rel="noopener noreferrer"
              />
            )
          }}
        />
      </AlertBox>
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
    </>
  );
}
