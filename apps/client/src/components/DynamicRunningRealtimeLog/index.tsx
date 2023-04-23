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
        <h4 className="text-primary-950 uppercase font-bold">
          {t("running:logs.title")}
        </h4>
        {isRefetching ? <Spinner /> : null}
      </div>
      <div className="border border-primary-500/60 bg-primary-400/25 py-2 px-4 rounded-lg">
        {logLines.map((logLine, index) => (
          <p
            className="text-zinc-700 font-mono"
            key={logLine + index}
          >
            {logLine}
          </p>
        ))}
      </div>
    </div>
  );
}
