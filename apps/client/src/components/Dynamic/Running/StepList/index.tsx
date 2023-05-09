import clsx from "clsx";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { Spinner } from "@app/components/Spinner";

interface DynamicRunningStepListProps {
  activeSteps: string[];
}

const steps = [
  "topology",
  "solvate",
  "ions",
  "minimizationsteepdesc",
  "minimizationconjgrad",
  "equilibrationnvt",
  "equilibrationnpt",
  "productionmd",
  "analyzemd"
];

function Step({
  active,
  running,
  step
}: {
  active: boolean;
  running: boolean;
  step: string;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={clsx("flex w-fit gap-x-2 rounded-full border px-2 py-1", {
        "border-zinc-950 bg-zinc-200 text-zinc-900 dark:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-200":
          !active && !running,
        "border-primary-950 bg-primary-100 text-primary-900 dark:border-primary-300 dark:bg-primary-900 dark:text-primary-200":
          active && !running,
        "border-blue-950 bg-blue-100 text-blue-900 dark:border-blue-300 dark:bg-blue-900 dark:text-blue-200":
          running
      })}
    >
      {active && !running ? (
        <CheckCircle className="my-auto h-5 w-5 stroke-primary-950 dark:stroke-primary-300" />
      ) : null}
      {!active && !running ? (
        <Clock className="my-auto h-5 w-5 stroke-zinc-950 dark:stroke-zinc-300" />
      ) : null}
      {running ? (
        <Spinner className="h-5 w-5 animate-spin fill-blue-950 text-blue-100 dark:fill-blue-300 dark:text-blue-950" />
      ) : null}
      <p>{t(`running:steps.${step}`)}</p>
    </div>
  );
}

export function DynamicRunningStepList({
  activeSteps
}: DynamicRunningStepListProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h4 className="font-bold uppercase text-primary-950 dark:text-primary-300">
        {t("running:steps.title")}
      </h4>
      <div className="flex flex-wrap items-center gap-1">
        {steps.map((step, index) => (
          <div
            className="flex items-center gap-x-1"
            key={step + index}
          >
            <Step
              active={activeSteps.includes(step)}
              running={activeSteps[activeSteps.length - 1] === step}
              step={step}
            />
            {index + 1 < steps.length ? (
              <ArrowRight className="h-4 w-4" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
