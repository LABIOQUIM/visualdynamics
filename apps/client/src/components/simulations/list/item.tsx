import {
  CheckCircle,
  Clock,
  Download,
  FileCode,
  FileDigit,
  Image,
  Scroll,
  Slash,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import Trans from "next-translate/Trans";
import useTranslation from "next-translate/useTranslation";

import { StatusButton } from "@app/components/general/buttons/Status";
import { Spinner } from "@app/components/general/loading-indicator/spinner";
import { cnMerge } from "@app/utils/cnMerge";

interface SimulationListItemProps {
  simulation: Simulation;
}

export function SimulationListItem({ simulation }: SimulationListItemProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div
      className={cnMerge(
        "flex w-full items-center gap-2 rounded-md border p-2",
        {
          "border-cyan-600 bg-cyan-400/20": simulation.status === "running",
          "border-zinc-600 bg-zinc-400/20": simulation.status === "canceled",
          "border-yellow-600 bg-yellow-400/20": simulation.status === "queued",
          "border-emerald-600 bg-emerald-400/20":
            simulation.status === "finished",
          "border-red-600 bg-red-400/20": simulation.status === "error"
        }
      )}
      key={simulation.celeryId}
    >
      {simulation.status === "finished" ? (
        <CheckCircle className="min-h-[2rem] min-w-[2rem] stroke-emerald-950 dark:stroke-emerald-300" />
      ) : null}
      {simulation.status === "canceled" ? (
        <Slash className="min-h-[2rem] min-w-[2rem] stroke-zinc-950 dark:stroke-zinc-300" />
      ) : null}
      {simulation.status === "queued" ? (
        <Clock className="min-h-[2rem] min-w-[2rem] stroke-yellow-950 dark:stroke-yellow-300" />
      ) : null}
      {simulation.status === "error" ? (
        <XCircle className="min-h-[2rem] min-w-[2rem] stroke-red-950 dark:stroke-red-300" />
      ) : null}
      {simulation.status === "running" ? (
        <Spinner className="min-h-[2rem] min-w-[2rem] fill-cyan-950 text-cyan-300 dark:fill-cyan-300 dark:text-cyan-900" />
      ) : null}
      <div className="flex flex-col gap-y-2">
        <small className="text-xs leading-none">
          {t("simulations:dynamic.id")}: {simulation.celeryId}
        </small>
        <div
          className={cnMerge({
            "text-cyan-950 dark:text-cyan-300": simulation.status === "running",
            "text-zinc-950 dark:text-zinc-300":
              simulation.status === "canceled",
            "text-yellow-950 dark:text-yellow-300":
              simulation.status === "queued",
            "text-emerald-950 dark:text-emerald-300":
              simulation.status === "finished",
            "text-red-950 dark:text-red-300": simulation.status === "error"
          })}
        >
          <p>
            <Trans
              components={{
                b: <b />
              }}
              i18nKey="simulations:header"
              values={{
                type: simulation.type,
                molecule: simulation.molecule,
                time: Intl.DateTimeFormat(router.locale, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                }).format(new Date(simulation.timestamp))
              }}
            />
          </p>
          {simulation.status === "error" ? (
            simulation.errored_command === "hm5ka" ? (
              <p>{t("simulations:errors.hm5ka")}</p>
            ) : (
              <Trans
                components={{
                  b: <b />
                }}
                i18nKey="simulations:errors.command"
                values={{ command: simulation.errored_command }}
              />
            )
          ) : null}
        </div>
        <div className="flex flex-col gap-y-1">
          <small className="flex gap-x-1">
            <Download className="h-4 w-4" />
            {t("simulations:downloads.title")}
          </small>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/api/downloads/commands?taskId=${simulation.celeryId}`}
              target="_blank"
            >
              <StatusButton
                className="w-full md:w-fit"
                LeftIcon={FileCode}
                status={simulation.status}
              >
                {t("simulations:downloads.commands")}
              </StatusButton>
            </Link>
            <Link
              href={`/api/downloads/log?taskId=${simulation.celeryId}`}
              target="_blank"
            >
              <StatusButton
                className="w-full md:w-fit"
                disabled={
                  simulation.status === "running" ||
                  simulation.status === "queued"
                }
                LeftIcon={Scroll}
                status={simulation.status}
              >
                {t("simulations:downloads.log")}
              </StatusButton>
            </Link>
            <Link
              href={`/api/downloads/results?taskId=${simulation.celeryId}`}
              target="_blank"
            >
              <StatusButton
                className="w-full md:w-fit"
                disabled={
                  simulation.status === "running" ||
                  simulation.status === "queued"
                }
                LeftIcon={FileDigit}
                status={simulation.status}
              >
                {t("simulations:downloads.results")}
              </StatusButton>
            </Link>
            <Link
              href={`/api/downloads/figures?taskId=${simulation.celeryId}`}
              target="_blank"
            >
              <StatusButton
                className="w-full md:w-fit"
                disabled={
                  simulation.status === "running" ||
                  simulation.status === "queued"
                }
                LeftIcon={Image}
                status={simulation.status}
              >
                {t("simulations:downloads.figures")}
              </StatusButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
