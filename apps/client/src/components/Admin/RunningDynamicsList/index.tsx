import { Server } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { DynamicRunningAbortButton } from "@app/components/Dynamic/Running/AbortButton";
import { GetAdminRunningDynamicsListResult } from "@app/queries/useAdminRunningDynamicsList";

interface AdminRunningDynamicsListProps {
  runningDynamics: GetAdminRunningDynamicsListResult;
  refetch: () => void;
}

export function AdminRunningDynamicsList({
  refetch,
  runningDynamics
}: AdminRunningDynamicsListProps) {
  const router = useRouter();
  const { t } = useTranslation(["admin-running"]);

  return (
    <div>
      {Object.keys(runningDynamics).map((worker) => {
        const dynamics = runningDynamics[worker];

        return (
          <div
            className="flex flex-col gap-2"
            key={worker}
          >
            <div className="flex items-center gap-x-2">
              <Server className="h-4 w-4 stroke-gray-500" />
              <p className="text-gray-500">{worker}</p>
            </div>
            {dynamics && dynamics.length > 0 ? (
              <ol className="flex flex-col gap-2">
                {dynamics.map((dynamic) => (
                  <li
                    className="flex flex-col gap-y-2 rounded-lg p-4 odd:bg-zinc-500/20 even:bg-zinc-500/10"
                    key={`${worker}_${dynamic.id}`}
                  >
                    <div className="flex flex-col gap-y-1">
                      <div className="flex gap-x-1">
                        <p className="whitespace-nowrap">
                          {t("admin-running:dynamic.path")}:
                        </p>
                        <p className="font-semibold">{dynamic.args[0]}</p>
                      </div>
                      <div className="flex gap-x-1">
                        <p>{t("admin-running:dynamic.started-at")}:</p>
                        <p className="font-semibold">
                          {Intl.DateTimeFormat(router.locale, {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          }).format(new Date(dynamic.time_start * 1000))}
                        </p>
                      </div>
                    </div>
                    <DynamicRunningAbortButton
                      refetch={refetch}
                      celeryId={dynamic.id}
                      folder={dynamic.args[0]}
                    />
                  </li>
                ))}
              </ol>
            ) : (
              <p>{t("admin-running:worker-empty")}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
