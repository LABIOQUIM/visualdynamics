"use client";
import { Server } from "lucide-react";

import { AbortSimulationButton } from "@/components/AbortSimulationButton";
import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H2 } from "@/components/Typography";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { dateFormat } from "@/utils/dateFormat";

import { useRunningSimulations } from "./useRunningSimulations";

export function RunningSimulationsList() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const { data, isLoading } = useRunningSimulations();

  if (!data && isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>{t("admin.simulations.no-contact")}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <H2>{t("admin.simulations.active")}</H2>
      {Object.keys(data).map((worker) => {
        const simulations = data[worker];

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
                          {t("admin.simulations.simulation.username")}:
                        </p>
                        <p className="font-semibold">
                          {
                            simulation.args[0].split("/")[
                              simulation.args[0].split("/").length - 2
                            ]
                          }
                        </p>
                      </div>
                      <div className="flex flex-col gap-x-1 lg:flex-row">
                        <p className="whitespace-nowrap">
                          {t("admin.simulations.simulation.path")}:
                        </p>
                        <p className="break-all font-semibold">
                          {simulation.args[0]}
                        </p>
                      </div>
                      <div className="flex flex-col gap-x-1 lg:flex-row">
                        <p>{t("admin.simulations.simulation.started-at")}:</p>
                        <p className="font-semibold">
                          {dateFormat(
                            new Date(simulation.time_start * 1000),
                            locale
                          )}
                        </p>
                      </div>

                      <p className="whitespace-nowrap">
                        {t("admin.simulations.simulation.actions")}:
                      </p>
                      <div className="flex flex-col gap-x-1 lg:flex-row">
                        <AbortSimulationButton
                          folder={simulation.args[0]}
                          taskId={simulation.id}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p>{t("admin.simulations.worker-empty")}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
