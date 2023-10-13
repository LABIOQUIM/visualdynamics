"use client";
import { Simulation } from "@prisma/client";
import { CheckCircle, Clock, Download, Slash, XCircle } from "lucide-react";

import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { useI18n } from "@/locales/client";
import { cnMerge } from "@/utils/cnMerge";
import { dateFormat } from "@/utils/dateFormat";

import { DownloadCommands } from "./DownloadCommands";
import { DownloadFigures } from "./DownloadFigures";
import { DownloadLogs } from "./DownloadLogs";
import { DownloadResults } from "./DownloadResults";

interface SimulationListItemProps {
  simulation: Simulation;
}

export function SimulationCard({ simulation }: SimulationListItemProps) {
  const t = useI18n();

  const variants: { [key: string]: Variant } = {
    queued: "warning",
    canceled: "grayscale",
    finished: "success",
    running: "info",
    error: "danger"
  };

  return (
    <div
      className={cnMerge(
        "flex w-full items-center gap-2 rounded-md border p-2",
        {
          "border-cyan-600 bg-cyan-400/20": simulation.status === "RUNNING",
          "border-zinc-600 bg-zinc-400/20": simulation.status === "CANCELED",
          "border-yellow-600 bg-yellow-400/20": simulation.status === "QUEUED",
          "border-emerald-600 bg-emerald-400/20":
            simulation.status === "COMPLETED",
          "border-red-600 bg-red-400/20": simulation.status === "ERRORED"
        }
      )}
      key={simulation.id}
    >
      {simulation.status === "COMPLETED" ? (
        <CheckCircle className="min-h-[2rem] min-w-[2rem] stroke-emerald-950 dark:stroke-emerald-300" />
      ) : null}
      {simulation.status === "CANCELED" ? (
        <Slash className="min-h-[2rem] min-w-[2rem] stroke-zinc-950 dark:stroke-zinc-300" />
      ) : null}
      {simulation.status === "QUEUED" ? (
        <Clock className="min-h-[2rem] min-w-[2rem] stroke-yellow-950 dark:stroke-yellow-300" />
      ) : null}
      {simulation.status === "ERRORED" ? (
        <XCircle className="min-h-[2rem] min-w-[2rem] stroke-red-950 dark:stroke-red-300" />
      ) : null}
      {simulation.status === "RUNNING" ? (
        <Spinner className="min-h-[2rem] min-w-[2rem] fill-cyan-950 text-cyan-300 dark:fill-cyan-300 dark:text-cyan-900" />
      ) : null}
      <div className="flex flex-col gap-y-2">
        <div
          className={cnMerge({
            "text-cyan-950 dark:text-cyan-300": simulation.status === "RUNNING",
            "text-zinc-950 dark:text-zinc-300":
              simulation.status === "CANCELED",
            "text-yellow-950 dark:text-yellow-300":
              simulation.status === "QUEUED",
            "text-emerald-950 dark:text-emerald-300":
              simulation.status === "COMPLETED",
            "text-red-950 dark:text-red-300": simulation.status === "ERRORED"
          })}
        >
          <p>
            {t("simulations.header", {
              type: simulation.type,
              molecule: simulation.moleculeName,
              time: dateFormat(new Date(simulation.createdAt))
            })}
          </p>
          {simulation.status === "ERRORED" ? (
            simulation.erroredOnCommand === "hm5ka" ? (
              <p>{t("simulations.errors.hm5ka")}</p>
            ) : (
              <p>
                {t("simulations.errors.command", {
                  command: <b>{simulation.erroredOnCommand}</b>
                })}
              </p>
            )
          ) : null}
        </div>
        <div className="flex flex-col gap-y-1">
          <small className="flex gap-x-1">
            <Download className="h-4 w-4" />
            {t("simulations.downloads.title")}
          </small>
          <div className="flex flex-wrap gap-2">
            <DownloadCommands
              simulation={simulation}
              variants={variants}
            />
            <DownloadLogs
              simulation={simulation}
              variants={variants}
            />
            <DownloadResults
              simulation={simulation}
              variants={variants}
            />
            <DownloadFigures
              simulation={simulation}
              variants={variants}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
