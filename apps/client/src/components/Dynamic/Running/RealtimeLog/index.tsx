import { useTranslation } from "next-i18next";

import { Spinner } from "@app/components/Spinner";

interface DynamicRunningRealtimeLogProps {
  logLines: string[];
  isRefetching: boolean;
}

export function DynamicRunningRealtimeLog({
  isRefetching,
  logLines
}: DynamicRunningRealtimeLogProps) {
  const { t } = useTranslation(["running"]);

  return (
    <div>
      <div className="flex gap-x-2">
        <h4 className="font-bold uppercase text-primary-950 dark:text-primary-300">
          {t("running:logs.title")}
        </h4>
        {isRefetching ? <Spinner /> : null}
      </div>
      <div className="rounded-lg border border-primary-500/60 bg-primary-400/25 px-4 py-2">
        {logLines.map((logLine, index) => (
          <p
            className="font-mono text-zinc-700 dark:text-zinc-200"
            key={logLine + index}
          >
            {logLine}
          </p>
        ))}
      </div>
    </div>
  );
}
