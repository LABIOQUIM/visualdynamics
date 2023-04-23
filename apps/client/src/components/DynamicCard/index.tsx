import clsx from "clsx";
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
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

import { StatusButton } from "@app/components/Button/Status";
import { Spinner } from "@app/components/Spinner";

interface DynamicCardProps {
  dynamic: Dynamic;
}

export function DynamicCard({ dynamic }: DynamicCardProps) {
  const { t } = useTranslation(["my-dynamics"]);
  const router = useRouter();

  return (
    <div
      className={clsx("flex w-full gap-2 rounded-md border p-2", {
        "border-cyan-600 bg-cyan-400/20": dynamic.status === "running",
        "border-zinc-600 bg-zinc-400/20": dynamic.status === "canceled",
        "border-yellow-600 bg-yellow-400/20": dynamic.status === "queued",
        "border-emerald-600 bg-emerald-400/20": dynamic.status === "finished",
        "border-red-600 bg-red-400/20": dynamic.status === "error"
      })}
      key={dynamic.celeryId}
    >
      {dynamic.status === "finished" ? (
        <CheckCircle className="mt-2 min-h-[2rem] min-w-[2rem] stroke-emerald-950 dark:stroke-emerald-300" />
      ) : null}
      {dynamic.status === "canceled" ? (
        <Slash className="mt-2 min-h-[2rem] min-w-[2rem] stroke-zinc-950 dark:stroke-zinc-300" />
      ) : null}
      {dynamic.status === "queued" ? (
        <Clock className="mt-2 min-h-[2rem] min-w-[2rem] stroke-yellow-950 dark:stroke-yellow-300" />
      ) : null}
      {dynamic.status === "error" ? (
        <XCircle className="mt-2 min-h-[2rem] min-w-[2rem] stroke-red-950 dark:stroke-red-300" />
      ) : null}
      {dynamic.status === "running" ? (
        <Spinner className="min-h-[2rem] min-w-[2rem] fill-blue-950 text-blue-100 dark:fill-blue-300" />
      ) : null}
      <div className="flex flex-col gap-y-2">
        <small className="text-xs leading-none">
          {t("my-dynamics:dynamic.id")}: {dynamic.celeryId}
        </small>
        <p
          className={clsx("flex", {
            "text-cyan-950 dark:text-cyan-300": dynamic.status === "running",
            "text-zinc-950 dark:text-zinc-300": dynamic.status === "canceled",
            "text-yellow-950 dark:text-yellow-300": dynamic.status === "queued",
            "text-emerald-950 dark:text-emerald-300":
              dynamic.status === "finished",
            "text-red-950 dark:text-red-300": dynamic.status === "error"
          })}
        >
          <p className="font-bold">{dynamic.type}</p>: {dynamic.molecule} @{" "}
          {Intl.DateTimeFormat(router.locale, {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          }).format(new Date(dynamic.timestamp))}
        </p>
        <div className="flex flex-col gap-y-1">
          <small className="flex gap-x-1">
            <Download className="h-4 w-4" />
            {t("my-dynamics:downloads.title")}
          </small>
          <div className="flex flex-wrap gap-2">
            <StatusButton
              className="w-full md:w-fit"
              LeftIcon={FileCode}
              onClick={() =>
                router.push(
                  `/api/downloads/commands?taskId=${dynamic.celeryId}`
                )
              }
              status={dynamic.status}
            >
              {t("my-dynamics:downloads.commands")}
            </StatusButton>
            <StatusButton
              className="w-full md:w-fit"
              disabled={dynamic.status === "running"}
              LeftIcon={Scroll}
              onClick={() =>
                router.push(`/api/downloads/log?taskId=${dynamic.celeryId}`)
              }
              status={dynamic.status}
            >
              {t("my-dynamics:downloads.log")}
            </StatusButton>
            <StatusButton
              className="w-full md:w-fit"
              disabled={dynamic.status === "running"}
              LeftIcon={FileDigit}
              onClick={() =>
                router.push(`/api/downloads/results?taskId=${dynamic.celeryId}`)
              }
              status={dynamic.status}
            >
              {t("my-dynamics:downloads.results")}
            </StatusButton>
            <StatusButton
              className="w-full md:w-fit"
              disabled={dynamic.status === "running"}
              LeftIcon={Image}
              onClick={() =>
                router.push(`/api/downloads/figures?taskId=${dynamic.celeryId}`)
              }
              status={dynamic.status}
            >
              {t("my-dynamics:downloads.figures")}
            </StatusButton>
          </div>
        </div>
      </div>
    </div>
  );
}
