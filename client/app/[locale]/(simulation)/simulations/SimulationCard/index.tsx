"use client";
import { Simulation } from "@prisma/client";
import {
  CheckCircle,
  Clock,
  Download,
  Hexagon,
  Slash,
  XCircle
} from "lucide-react";

import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { cnMerge } from "@/utils/cnMerge";
import { dateFormat } from "@/utils/dateFormat";

import { DownloadCommands } from "./DownloadCommands";
import { DownloadFigures } from "./DownloadFigures";
import { DownloadLogs } from "./DownloadLogs";
import { DownloadResults } from "./DownloadResults";

interface SimulationListItemProps {
  simulation?: Simulation;
}

export function SimulationCard({ simulation }: SimulationListItemProps) {
  const t = useI18n();
  const locale = useCurrentLocale();

  const variants: { [key: string]: Variant } = {
    queued: "warning",
    canceled: "grayscale",
    finished: "success",
    running: "info",
    error: "danger"
  };

  if (!simulation) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-2 rounded-md border border-zinc-600 bg-zinc-400/20 p-2">
        <Hexagon className="min-h-[2rem] min-w-[2rem]" />
        <h1>{t("simulations.no-sim-yet")}</h1>
      </div>
    );
  }

  return (
    <div
      className={cnMerge(
        "relative flex h-full w-full items-center gap-2 rounded-md border p-2",
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
      <div className="absolute right-4 top-4">
        {simulation.status === "COMPLETED" && (
          <CheckCircle className="min-h-[2rem] min-w-[2rem] stroke-emerald-950 dark:stroke-emerald-300" />
        )}
        {simulation.status === "CANCELED" && (
          <Slash className="min-h-[2rem] min-w-[2rem] stroke-zinc-950 dark:stroke-zinc-300" />
        )}
        {simulation.status === "QUEUED" && (
          <Clock className="min-h-[2rem] min-w-[2rem] stroke-yellow-950 dark:stroke-yellow-300" />
        )}
        {simulation.status === "ERRORED" && (
          <XCircle className="min-h-[2rem] min-w-[2rem] stroke-red-950 dark:stroke-red-300" />
        )}
        {simulation.status === "RUNNING" && (
          <Spinner className="min-h-[2rem] min-w-[2rem] fill-cyan-950 text-cyan-300 dark:fill-cyan-300 dark:text-cyan-900" />
        )}
      </div>

      <div className="flex h-full w-full flex-col justify-between gap-y-2">
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
            {t("simulations.molecule", {
              molecule: <b>{simulation.moleculeName}</b>
            })}
          </p>
          <p>
            {t("simulations.createdAt", {
              time: <b>{dateFormat(new Date(simulation.createdAt), locale)}</b>
            })}
          </p>

          {simulation.startedAt && (
            <p>
              {t("simulations.startedAt", {
                time: (
                  <b>{dateFormat(new Date(simulation.startedAt), locale)}</b>
                )
              })}
            </p>
          )}
          {simulation.endedAt && (
            <p>
              {t("simulations.endedAt", {
                time: <b>{dateFormat(new Date(simulation.endedAt), locale)}</b>
              })}
            </p>
          )}
          {simulation.status === "ERRORED" ? (
            simulation.erroredOnCommand === "hm5ka" ? (
              <p>{t("simulations.errors.hm5ka")}</p>
            ) : (
              <p
                className="line-clamp-1"
                title={simulation.erroredOnCommand!}
              >
                {t("simulations.errors.command", {
                  command: <b>{simulation.erroredOnCommand}</b>
                })}
              </p>
            )
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-y-1">
          <small className="flex gap-x-1">
            <Download className="h-4 w-4" />
            {t("simulations.downloads.title")}
          </small>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 xl:flex-row">
              <DownloadCommands
                simulation={simulation}
                variants={variants}
              />
              <DownloadLogs
                simulation={simulation}
                variants={variants}
              />
            </div>
            <div className="flex flex-col gap-2 xl:flex-row">
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
    </div>
  );
}
