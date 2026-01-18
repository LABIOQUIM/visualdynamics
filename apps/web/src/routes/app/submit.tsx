import classes from "./submit.module.css";

import { Stepper } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "preact/hooks";

import { PageLayout } from "@/components/PageLayout";
import { SimulationSubmitFileStep } from "@/components/SimulationSubmit/FileStep";
import {
  SimulationSubmitFormProvider,
  type SimulationSubmitFormValues,
  useSimulationSubmitForm,
} from "@/components/SimulationSubmit/FormContext";
import { SimulationSubmitParamsStep } from "@/components/SimulationSubmit/ParamsStep";
import { ReviewStep } from "@/components/SimulationSubmit/ReviewStep";
import { submitSimulation } from "@/mutations/submitSimulation";

export const Route = createFileRoute("/app/submit")({
  component: RouteComponent,
});

function RouteComponent() {
  const [active, setActive] = useState(0);
  const form = useSimulationSubmitForm({
    mode: "uncontrolled",
  });

  function nextStep() {
    setActive((current) => (current < 2 ? current + 1 : current));
  }

  function prevStep() {
    setActive((current) => (current > 0 ? current - 1 : current));
  }

  async function onSubmit(values: SimulationSubmitFormValues) {
    await submitSimulation(values, true);
  }

  return (
    <PageLayout className={classes.container}>
      <SimulationSubmitFormProvider form={form}>
        <form
          className={classes.formContainer}
          onSubmit={form.onSubmit(onSubmit)}
        >
          <Stepper
            active={active}
            classNames={{
              root: classes.formContainer,
              content: classes.formContainer,
            }}
          >
            <Stepper.Step description="Select simulation files" label="Files">
              <SimulationSubmitFileStep next={nextStep} />
            </Stepper.Step>
            <Stepper.Step description="Select simulation params" label="Params">
              <SimulationSubmitParamsStep next={nextStep} prev={prevStep} />
            </Stepper.Step>
            <Stepper.Step
              description="Review params and submit"
              label="Review and submit"
            >
              <ReviewStep prev={prevStep} />
            </Stepper.Step>
            <Stepper.Completed>
              Completed, click back button to get to previous step
            </Stepper.Completed>
          </Stepper>
        </form>
      </SimulationSubmitFormProvider>
    </PageLayout>
  );
}
