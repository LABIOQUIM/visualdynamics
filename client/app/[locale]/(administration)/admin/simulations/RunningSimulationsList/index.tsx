"use client";
import { Server } from "lucide-react";

import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H2 } from "@/components/Typography";
import { useI18n } from "@/locales/client";

import { useRunningSimulations } from "./useRunningSimulations";

export function RunningSimulationsList() {
  const t = useI18n();
  const { data } = useRunningSimulations();

  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
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
                          {t("admin.simulations.simulations.username")}:
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
                          {t("admin.simulations.simulations.path")}:
                        </p>
                        <p className="font-semibold">{simulation.args[0]}</p>
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
