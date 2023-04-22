import clsx from "clsx";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Spinner } from "../Spinner";

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
  const { t } = useTranslation(["running"]);

  return (
    <div
      className={clsx("py-1 px-2 flex border gap-x-2 w-fit rounded-full", {
        "bg-zinc-200 text-zinc-900 border-zinc-950 ": !active && !running,
        "bg-primary-100 text-primary-900 border-primary-950":
          active && !running,
        "bg-blue-100 text-blue-900 border-blue-950": running
      })}
    >
      {active && !running ? (
        <CheckCircle className="h-5 w-5 my-auto stroke-primary-950" />
      ) : null}
      {!active && !running ? (
        <Clock className="h-5 w-5 my-auto stroke-zinc-950" />
      ) : null}
      {running ? (
        <Spinner className="w-5 h-5 text-blue-100 animate-spin fill-blue-950" />
      ) : null}
      <p>{t(`running:steps.${step}`)}</p>
    </div>
  );
}

export function DynamicRunningStepList({
  activeSteps
}: DynamicRunningStepListProps) {
  const { t } = useTranslation(["features"]);

  return (
    <div>
      <h4 className="text-primary-950 uppercase font-bold">
        {t("running:steps.title")}
      </h4>
      <div className="flex items-center gap-1 flex-wrap">
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
