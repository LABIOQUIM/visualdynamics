import classes from "./index.module.css";

import {
  Blockquote,
  Box,
  Button,
  FileInput,
  Group,
  NumberInput,
  Radio,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconChevronDown,
  IconDownload,
  IconInfoCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "preact/hooks";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  simulationSchema,
  type SimulationFormValues,
} from "./-components/schema";
import {
  allForceFields,
  boxTypes,
  simulationTypeRadioData,
  waterModels,
} from "./-components/constants";

import { Heading } from "@/components/Heading";
import { MolViewer } from "@/components/MolViewer";
import { PageLayout } from "@/components/PageLayout";
import { getAPIClient } from "@/lib/api";
import { submitSimulation } from "@/mutations/submitSimulation";
import type { LatestMacromolecules } from "@/queries/latestMacromolecules";

export const Route = createFileRoute("/app/submit/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [files, setFiles] = useState<LatestMacromolecules>({
    macromolecule: "",
  });

  const { control, handleSubmit, setValue } = useForm<SimulationFormValues>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      forceField: "",
      waterModel: "",
      boxType: "",
      boxDistance: 0.1,
    },
  });

  const simulationType = useWatch({ control, name: "type" });
  const filePDB = useWatch({ control, name: "filePDB" });
  const fileLigandPDB = useWatch({ control, name: "fileLigandPDB" });

  const showLigandFields = simulationType === "acpype";
  const forceFields =
    simulationType === "acpype" ? allForceFields.acpype : allForceFields.apo;

  const selectDropdownStyles = {
    dropdown: { maxHeight: 200, overflowY: "auto" as const },
  };

  // Reset force field when simulation type changes
  useEffect(() => {
    setValue("forceField", "");
  }, [simulationType, setValue]);

  // Update 3D viewer when protein PDB file changes
  useEffect(() => {
    if (filePDB instanceof File) {
      filePDB.text().then((text) => {
        setFiles((prev) => ({ ...prev, macromolecule: text }));
      });
    } else {
      setFiles((prev) => ({ ...prev, macromolecule: "" }));
    }
  }, [filePDB]);

  // Update 3D viewer when ligand PDB file changes
  useEffect(() => {
    if (fileLigandPDB instanceof File) {
      fileLigandPDB.text().then((text) => {
        setFiles((prev) => ({ ...prev, ligandPdb: text }));
      });
    } else {
      setFiles((prev) => ({ ...prev, ligandPdb: undefined }));
    }
  }, [fileLigandPDB]);

  function renderSelectOption(data: Record<string, string>, value: string) {
    return (
      <Box>
        <Text c="dimmed" size="xs">
          {value}
        </Text>
        <Text size="sm">{data[value]}</Text>
      </Box>
    );
  }

  const onRunSimulation = handleSubmit(async (values) => {
    await submitSimulation(values, true);
  });

  const onDownloadCommands = handleSubmit(async (values) => {
    await submitSimulation(values, false);
  });

  async function onDownloadMDPFiles() {
    const api = await getAPIClient();
    const response = await api.get("/simulation/downloads/mdp", {
      responseType: "arraybuffer",
    });
    if (!response.data) return;
    const link = document.createElement("a");
    link.download = "mdp_files.zip";
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    link.href = blobUrl;
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  }

  return (
    <PageLayout>
      <Heading title="Submit Simulation" />
      <form className={classes.form} onSubmit={onRunSimulation}>
        <div className={classes.layout}>
          <Stack className={classes.formColumn} gap="md">
            <Box>
              <Title mb="xs" order={5}>
                Simulation Type
              </Title>
              <Controller
                control={control}
                name="type"
                render={({ field, fieldState }) => (
                  <Radio.Group
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    value={field.value}
                    withAsterisk
                  >
                    <Group
                      grow
                      preventGrowOverflow={false}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                      }}
                      wrap="nowrap"
                    >
                      {simulationTypeRadioData.map((item) => (
                        <Radio.Card
                          className={classes.radioRoot}
                          h="100%"
                          key={item.name}
                          radius="md"
                          value={item.value}
                        >
                          <Group align="flex-start" wrap="nowrap">
                            <Radio.Indicator />
                            <div>
                              <Text c="bright" ff="monospace" fw="bold">
                                {item.name}
                              </Text>
                              <Text c="dimmed" mt={4} size="xs">
                                {item.description}
                              </Text>
                            </div>
                          </Group>
                        </Radio.Card>
                      ))}
                    </Group>
                  </Radio.Group>
                )}
              />
            </Box>

            <Box>
              <Title mb="xs" order={5}>
                Files
              </Title>
              <Stack gap="xs">
                <Controller
                  control={control}
                  name="filePDB"
                  render={({ field: { value, onChange, ref }, fieldState }) => (
                    <FileInput
                      accept=".pdb"
                      clearable
                      error={fieldState.error?.message}
                      label="Protein (PDB)"
                      onChange={onChange}
                      placeholder="Upload Protein PDB file"
                      ref={ref}
                      value={value}
                      withAsterisk
                    />
                  )}
                />
                {showLigandFields && (
                  <>
                    <Controller
                      control={control}
                      name="fileLigandPDB"
                      render={({
                        field: { value, onChange, ref },
                        fieldState,
                      }) => (
                        <FileInput
                          accept=".pdb"
                          clearable
                          error={fieldState.error?.message}
                          label="Ligand (PDB)"
                          onChange={onChange}
                          placeholder="Upload Ligand PDB file"
                          ref={ref}
                          value={value}
                          withAsterisk
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name="fileLigandITP"
                      render={({
                        field: { value, onChange, ref },
                        fieldState,
                      }) => (
                        <FileInput
                          accept=".itp"
                          clearable
                          error={fieldState.error?.message}
                          label="Ligand (ITP)"
                          onChange={onChange}
                          placeholder="Upload Ligand ITP file"
                          ref={ref}
                          value={value}
                          withAsterisk
                        />
                      )}
                    />
                  </>
                )}
              </Stack>
            </Box>

            <Box>
              <Title mb="xs" order={5}>
                Parameters
              </Title>
              <Stack gap="xs">
                <Controller
                  control={control}
                  name="forceField"
                  render={({ field, fieldState }) => (
                    <Select
                      data={Object.keys(forceFields)}
                      error={fieldState.error?.message}
                      label="Force Field"
                      onChange={field.onChange}
                      placeholder="Select a force field"
                      renderOption={({ option }) =>
                        renderSelectOption(forceFields, option.value)
                      }
                      rightSection={<IconChevronDown />}
                      searchable
                      styles={selectDropdownStyles}
                      value={field.value}
                      withScrollArea={false}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="waterModel"
                  render={({ field, fieldState }) => (
                    <Select
                      data={Object.keys(waterModels)}
                      error={fieldState.error?.message}
                      label="Water Model"
                      onChange={field.onChange}
                      placeholder="Select a water model"
                      renderOption={({ option }) =>
                        renderSelectOption(waterModels, option.value)
                      }
                      rightSection={<IconChevronDown />}
                      searchable
                      styles={selectDropdownStyles}
                      value={field.value}
                      withScrollArea={false}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="boxType"
                  render={({ field, fieldState }) => (
                    <Select
                      data={Object.keys(boxTypes)}
                      error={fieldState.error?.message}
                      label="Box Type"
                      onChange={field.onChange}
                      placeholder="Select a box type"
                      renderOption={({ option }) =>
                        renderSelectOption(boxTypes, option.value)
                      }
                      rightSection={<IconChevronDown />}
                      searchable
                      styles={selectDropdownStyles}
                      value={field.value}
                      withScrollArea={false}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="boxDistance"
                  render={({
                    field: { value, onChange, ...field },
                    fieldState,
                  }) => (
                    <NumberInput
                      {...field}
                      allowNegative={false}
                      decimalScale={1}
                      error={fieldState.error?.message}
                      fixedDecimalScale
                      label="Box Distance (nm)"
                      max={1.2}
                      min={0.1}
                      onChange={(val) => {
                        if (
                          val === "" ||
                          val === null ||
                          typeof val === "undefined"
                        ) {
                          onChange(undefined);
                        } else if (typeof val === "number") {
                          onChange(val);
                        } else {
                          const parsed = Number(val);
                          onChange(Number.isNaN(parsed) ? undefined : parsed);
                        }
                      }}
                      placeholder="Input a value"
                      step={0.1}
                      value={value ?? undefined}
                    />
                  )}
                />
              </Stack>
            </Box>

            <Blockquote color="blue" icon={<IconInfoCircle />} mt="xs">
              Simulation time is fixed at 5ns. Contact{" "}
              <a href="mailto:fernando.zanchi@fiocruz.br">
                fernando.zanchi@fiocruz.br
              </a>{" "}
              if you need more time.
            </Blockquote>

            <Group grow>
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={onDownloadCommands}
                type="button"
                variant="light"
              >
                Commands
              </Button>
              <Button
                leftSection={<IconDownload size={16} />}
                onClick={onDownloadMDPFiles}
                type="button"
                variant="light"
              >
                MDP Files
              </Button>
              <Button
                leftSection={<IconPlayerPlay size={16} />}
                type="submit"
              >
                Run Simulation
              </Button>
            </Group>
          </Stack>

          <div className={classes.viewerColumn}>
            <MolViewer macromolecules={files} />
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
