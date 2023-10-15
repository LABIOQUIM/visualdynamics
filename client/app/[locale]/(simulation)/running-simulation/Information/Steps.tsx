import { useEffect } from "react";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";

import { Spinner } from "@/components/LoadingIndicators/Spinner";
import { H2 } from "@/components/Typography";
import { useI18n } from "@/locales/client";
import { cnMerge } from "@/utils/cnMerge";

import classes from "./Steps.module.css";

interface Props {
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
] as const;

function Step({
  active,
  running,
  step
}: {
  active: boolean;
  running: boolean;
  step: (typeof steps)[number];
}) {
  const t = useI18n();

  useEffect(() => {
    if (running) {
      const stepButton = document.getElementById(step);

      if (stepButton) {
        stepButton.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [running, step]);

  return (
    <div
      id={step}
      className={cnMerge("flex w-fit gap-x-2 rounded-full border px-2 py-1", {
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
      <p className="whitespace-nowrap">
        {t(`running-simulation.steps.${step}`)}
      </p>
    </div>
  );
}

export function Steps({ activeSteps }: Props) {
  const t = useI18n();

  return (
    <div className="flex w-full flex-col gap-2 overflow-hidden">
      <H2>{t("running-simulation.steps.title")}</H2>
      <div
        className={`flex max-w-full items-center gap-x-1 overflow-auto ${classes.stepsScroll}`}
      >
        {steps.map((step, index) => (
          <div
            className="flex items-center gap-x-1"
            key={step}
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
