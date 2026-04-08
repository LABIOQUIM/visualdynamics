import classes from "./index.module.css";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Blockquote, Stack } from "@mantine/core";
import { useFlag } from "@openfeature/react-sdk";
import { IconInfoCircle } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import { allForceFields } from "./-components/constants";
import { FilesSection } from "./-components/FilesSection";
import { FormActions } from "./-components/FormActions";
import { ParametersSection } from "./-components/ParametersSection";
import {
  type SimulationFormValues,
  simulationSchema,
} from "./-components/schema";
import { SectionContainer } from "./-components/SectionContainer";
import { SimulationTypeSelector } from "./-components/SimulationTypeSelector";
import { useSimulationViewer } from "./-components/useSimulationViewer";

import { Heading } from "@/components/Heading";
import { MolViewer } from "@/components/MolViewer";
import { PageLayout } from "@/components/PageLayout";
import { submitSimulation } from "@/mutations/submitSimulation";

export const Route = createFileRoute("/app/submit/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { control, handleSubmit, setValue, formState } =
    useForm<SimulationFormValues>({
      resolver: zodResolver(simulationSchema),
      defaultValues: {
        type: "apo",
        forceField: "",
        waterModel: "",
        boxType: "",
        boxDistance: 0.1,
        ligands: [],
      },
    });

  const simulationType = useWatch({ control, name: "type" });
  const filePDB = useWatch({ control, name: "filePDB" });
  const ligands = useWatch({ control, name: "ligands" });
  const { value: maxLigands } = useFlag("simulation-max-ligands", 20);

  const files = useSimulationViewer(filePDB, ligands);
  const isAcpype = simulationType === "acpype";
  const forceFields = isAcpype ? allForceFields.acpype : allForceFields.apo;

  useEffect(() => {
    setValue("forceField", "");
  }, [simulationType, setValue]);

  return (
    <PageLayout>
      <Heading title="Submit Simulation" />
      <form
        className={classes.form}
        onSubmit={handleSubmit((v) => submitSimulation(v, true))}
      >
        <div className={classes.layout}>
          <div className={classes.formColumn}>
            <Stack className={classes.formScrollArea} gap="lg">
              <SectionContainer title="Simulation Type">
                <SimulationTypeSelector control={control} />
              </SectionContainer>
              <SectionContainer title="Files">
                <FilesSection
                  control={control}
                  formState={formState}
                  isAcpype={isAcpype}
                  maxLigands={maxLigands}
                />
              </SectionContainer>
              <ParametersSection control={control} forceFields={forceFields} />
            </Stack>
            <FormActions
              containerClassName={classes.formButtons}
              onDownloadCommands={handleSubmit((v) =>
                submitSimulation(v, false),
              )}
              submitClassName={classes.formSubmitButton}
            />
          </div>

          <div className={classes.viewerColumn}>
            <MolViewer macromolecules={files} />
            <Blockquote color="blue" icon={<IconInfoCircle />}>
              Simulation time is fixed at 5ns. Contact{" "}
              <a href="mailto:fernando.zanchi@fiocruz.br">
                fernando.zanchi@fiocruz.br
              </a>{" "}
              if you need more time.
            </Blockquote>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
