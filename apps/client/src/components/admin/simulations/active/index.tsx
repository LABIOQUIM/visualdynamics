import { Server } from "lucide-react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { GetActiveSimulationsResult } from "@app/components/admin/simulations/active/useActiveSimulations";
import { SimulationAbortButton } from "@app/components/simulations/running/abort-button";

interface SimulationsRunningListProps {
  workers: GetActiveSimulationsResult;
  refetch: () => void;
}

export function ActiveSimulationsList({
  refetch,
  workers
}: SimulationsRunningListProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div>
      {Object.keys(workers).map((worker) => {
        const simulations = workers[worker];

        return (
          <div
            className="flex flex-col gap-2"
            key={worker}
          >
            <div className="flex items-center gap-x-2">
              <Server className="h-4 w-4 stroke-gray-500" />
              <p className="text-gray-500">{worker}</p>
            </div>
            {simulations && simulations.length > 0 ? (
              <ol className="flex flex-col gap-2">
                {simulations.map((simulation) => (
                  <li
                    className="flex flex-col gap-y-2 rounded-lg p-4 odd:bg-zinc-500/20 even:bg-zinc-500/10"
                    key={`${worker}_${simulation.id}`}
                  >
                    <div className="flex flex-col gap-y-4 lg:gap-y-1">
                      <div className="flex flex-col gap-x-1 lg:flex-row">
                        <p className="whitespace-nowrap">
                          {t("admin-simulations:simulations.username")}:
                        </p>
                        <p className="font-semibold">
                          {
                            simulation.args[0].split("/")[
                              simulation.args[0].split("/").length - 4
                            ]
                          }
                        </p>
                      </div>
                      <div className="flex flex-col gap-x-1 lg:flex-row">
                        <p className="whitespace-nowrap">
                          {t("admin-simulations:simulations.path")}:
                        </p>
                        <p className="font-semibold">{simulation.args[0]}</p>
                      </div>
                      <div className="flex flex-col gap-x-1 lg:flex-row">
                        <p>{t("admin-simulations:simulations.started-at")}:</p>
                        <p className="font-semibold">
                          {Intl.DateTimeFormat(router.locale, {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZoneName: "short"
                          }).format(new Date(simulation.time_start * 1000))}
                        </p>
                      </div>
                    </div>
                    <SimulationAbortButton
                      refetch={refetch}
                      celeryId={simulation.id}
                      folder={simulation.args[0]}
                    />
                  </li>
                ))}
              </ol>
            ) : (
              <p>{t("admin-simulations:worker-empty")}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
