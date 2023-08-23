import { FileDown, RefreshCw } from "lucide-react";
import NextLink from "next/link";

import { DownloadMDP } from "@/app/[locale]/(simulation)/simulations/DownloadMDP";
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
      <DownloadMDP />
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
