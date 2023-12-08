import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H2 } from "@/components/Typography";
import { useI18n } from "@/locales/client";

type Props = {
  logLines: string[];
  isRefetching: boolean;
};

export function RealtimeLog({ isRefetching, logLines }: Props) {
  const t = useI18n();

  return (
    <div className="flex max-h-full flex-col gap-2">
      <div className="flex gap-x-2">
        <H2>{t("running-simulation.logs.title")}</H2>
        {isRefetching ? <Spinner /> : null}
      </div>
      <div className="flex h-full max-h-full flex-col overflow-y-scroll rounded-lg border border-primary-500/60 bg-primary-400/25 px-4 py-2">
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
