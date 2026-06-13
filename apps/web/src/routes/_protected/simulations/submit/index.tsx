import classes from "./index.module.css";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Blockquote, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconDownload,
  IconInfoCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { FilesSection } from "./-components/FilesSection";
import { ParametersSection } from "./-components/ParametersSection";
import {
  type SimulationFormValues,
  simulationSchema,
} from "./-components/schema";
import { SectionContainer } from "./-components/SectionContainer";
import { SimulationMolViewer } from "./-components/SimulationMolViewer";
import { SimulationTypeSelector } from "./-components/SimulationTypeSelector";

import { PageLayout } from "@/components/PageLayout";
import { submitSimulation } from "@/mutations/submitSimulation";

import { useFlag } from "@openfeature/react-sdk";
import { Button } from "@mantine/core";
import { downloadMdpFiles } from "@/mutations/downloadMdpFiles";

export const Route = createFileRoute("/_protected/simulations/submit/")({
  component: RouteComponent,
  staticData: {
    breadcrumb: "Submit New Simulation",
  },
});

function downloadCommandsFile(
  data: { status: string; commands: string[] },
  type: string,
  filePDB: File,
  ligands?: { fileITP: File; filePDB: File }[],
) {
  let filename = type;
  filename += `-${filePDB.name.split(".")[0]}`;
  if (ligands) {
    for (const ligand of ligands) {
      filename += `-${ligand.fileITP.name.split(".")[0]}`;
    }
  }
  filename += "-commands.txt";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," +
      encodeURIComponent(data.commands.join("")),
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const latestValues = useRef<SimulationFormValues | null>(null);
  const { value: submissionEnabled } = useFlag("simulation-submission", false);
  const { control, handleSubmit, resetField, formState } =
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

  const runMutation = useMutation({
    mutationFn: (values: SimulationFormValues) =>
      submitSimulation(values, true),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["user-simulations"] });
      notifications.show({
        title: "Added to queue",
        message: "Your simulation has been added to the execution queue.",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
      if (response.data.status === "added-to-queue") {
        navigate({
          to: "/simulations/$simulationId",
          params: { simulationId: response.data.simulationId },
        });
      }
    },
  });

  const commandsMutation = useMutation({
    mutationFn: (values: SimulationFormValues) => {
      latestValues.current = values;
      return submitSimulation(values, false);
    },
    onSuccess: (response) => {
      const v = latestValues.current;
      if (
        !v ||
        response.data.status !== "generated" ||
        !("commands" in response.data)
      ) {
        return;
      }
      downloadCommandsFile(response.data, v.type, v.filePDB, v.ligands);
      notifications.show({
        title: "Commands downloaded!",
        message: "Your simulation commands have been generated and downloaded.",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
    },
  });

  return (
    <PageLayout className={classes.pageLayout} title="Submit Simulation">
      <form
        className={classes.form}
        onSubmit={handleSubmit((v) => runMutation.mutate(v))}
      >
        <div className={classes.layout}>
          <div className={classes.formColumn}>
            <Stack className={classes.formScrollArea} gap="lg">
              <SectionContainer title="Simulation Type">
                <SimulationTypeSelector
                  control={control}
                  onTypeChange={() => resetField("forceField")}
                />
              </SectionContainer>
              <SectionContainer title="Files">
                <FilesSection control={control} formState={formState} />
              </SectionContainer>
              <ParametersSection control={control} />
            </Stack>
            <div className={classes.formButtons}>
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={handleSubmit((v) => commandsMutation.mutate(v))}
                type="button"
                variant="light"
                loading={commandsMutation.isPending}
              >
                Commands
              </Button>
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={downloadMdpFiles}
                type="button"
                variant="light"
              >
                MDP Files
              </Button>
              <Button
                className={classes.formSubmitButton}
                disabled={!submissionEnabled}
                leftSection={<IconPlayerPlay size={16} />}
                type="submit"
                loading={runMutation.isPending}
              >
                Run Simulation
              </Button>
            </div>
          </div>

          <div className={classes.viewerColumn}>
            <SimulationMolViewer control={control} />
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
