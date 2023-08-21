import { FileDown, RefreshCw } from "lucide-react";
import NextLink from "next/link";

import { Button } from "@/components/Button";
import { useI18n } from "@/locales/client";
import { cnMerge } from "@/utils/cnMerge";

interface MyDynamicsHeader {
  isRefetching?: boolean;
  isLoading?: boolean;
  refetch: () => void;
}

export function Header({ refetch, isLoading, isRefetching }: MyDynamicsHeader) {
  const t = useI18n();

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <NextLink
        href="/api/downloads/mdp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button LeftIcon={FileDown}>{t("simulations.downloads.mdp")}</Button>
      </NextLink>
      <Button
        iconClassName={cnMerge({
          "animate-spin": isRefetching || isLoading
        })}
        disabled={isRefetching || isLoading}
        LeftIcon={RefreshCw}
        onClick={() => refetch()}
        isOutline
        noBorder
      />
    </div>
  );
}
