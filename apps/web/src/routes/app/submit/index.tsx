import classes from "./index.module.css";

import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Blockquote,
  Box,
  Button,
  FileInput,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useFlag } from "@openfeature/react-sdk";
import {
  IconChevronDown,
  IconDownload,
  IconInfoCircle,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";

import {
  allForceFields,
  boxTypes,
  simulationTypes,
  waterModels,
} from "./-components/constants";
import {
  type SimulationFormValues,
  simulationSchema,
} from "./-components/schema";

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

  const {
    fields: ligandFields,
    append: appendLigand,
    remove: removeLigand,
  } = useFieldArray({ control, name: "ligands" });

  const simulationType = useWatch({ control, name: "type" });
  const filePDB = useWatch({ control, name: "filePDB" });
  const allLigandPDBs = useWatch({ control, name: "ligands" });

  const { value: maxLigands } = useFlag("simulation-max-ligands", 20);

  const showLigandFields = simulationType === "acpype";
  const atLigandLimit = ligandFields.length >= maxLigands;
  const forceFields =
    simulationType === "acpype" ? allForceFields.acpype : allForceFields.apo;

  const selectDropdownStyles = {
    dropdown: { maxHeight: 200, overflowY: "auto" as const },
  };

  // Reset force field when simulation type changes
  useEffect(() => {
    setValue("forceField", "");
  }, [simulationType, setValue]);

  // Auto-add the first ligand when switching to ACPYPE
  useEffect(() => {
    if (simulationType === "acpype" && ligandFields.length === 0) {
      appendLigand({
        filePDB: undefined as unknown as File,
        fileITP: undefined as unknown as File,
      });
    }
  }, [simulationType, ligandFields.length, appendLigand]);

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

  // Update 3D viewer when any ligand PDB file changes
  useEffect(() => {
    const ligandFiles = (allLigandPDBs ?? [])
      .map((l) => l?.filePDB)
      .filter((f): f is File => f instanceof File);

    if (ligandFiles.length === 0) {
      setFiles((prev) => ({ ...prev, ligandPdbs: undefined }));
      return;
    }

    Promise.all(ligandFiles.map((f) => f.text())).then((texts) => {
      setFiles((prev) => ({ ...prev, ligandPdbs: texts }));
    });
  }, [allLigandPDBs]);

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
          <Stack className={classes.formColumn} gap="lg">
            {/* Simulation Type */}
            <Box>
              <Title mb="xs" order={5}>
                Simulation
              </Title>
              <Controller
                control={control}
                name="type"
                render={({ field, fieldState }) => (
                  <Select
                    data={Object.keys(simulationTypes)}
                    error={fieldState.error?.message}
                    label="Type"
                    onChange={field.onChange}
                    placeholder="Select a simulation type"
                    renderOption={({ option }) =>
                      renderSelectOption(simulationTypes, option.value)
                    }
                    rightSection={<IconChevronDown />}
                    searchable
                    styles={selectDropdownStyles}
                    value={field.value}
                    withScrollArea={false}
                  />
                )}
              />
            </Box>

            {/* Files */}
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
                      description="PDB format"
                      error={fieldState.error?.message}
                      label="Protein"
                      onChange={onChange}
                      placeholder="Upload protein PDB file"
                      ref={ref}
                      value={value}
                      withAsterisk
                    />
                  )}
                />
                {showLigandFields && (
                  <Box>
                    <Group align="center" justify="space-between" mb="xs">
                      <Title order={6}>Ligands</Title>
                      <Group gap="xs">
                        {/* Counter — always rendered to avoid layout shift */}
                        <Text
                          c={atLigandLimit ? "orange" : "dimmed"}
                          size="xs"
                          style={{
                            visibility:
                              ligandFields.length > 0 ? "visible" : "hidden",
                          }}
                        >
                          {ligandFields.length}/{maxLigands}
                        </Text>
                        <Button
                          disabled={atLigandLimit}
                          leftSection={<IconPlus size={14} />}
                          onClick={() =>
                            appendLigand({
                              filePDB: undefined as unknown as File,
                              fileITP: undefined as unknown as File,
                            })
                          }
                          size="xs"
                          variant="light"
                        >
                          Add Ligand
                        </Button>
                      </Group>
                    </Group>
                    {formState.errors.ligands?.message && (
                      <Text c="red" mb="xs" size="sm">
                        {formState.errors.ligands.message as string}
                      </Text>
                    )}
                    <Stack gap="sm">
                      {ligandFields.map((field, index) => (
                        <Paper key={field.id} p="sm" radius="sm" withBorder>
                          <Group justify="space-between" mb="xs">
                            <Text fw={500} size="sm">
                              Ligand {index + 1}
                            </Text>
                            <ActionIcon
                              color="red"
                              onClick={() => removeLigand(index)}
                              size="sm"
                              variant="subtle"
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                          <Group grow>
                            <Controller
                              control={control}
                              name={`ligands.${index}.filePDB`}
                              render={({
                                field: { value, onChange, ref },
                                fieldState,
                              }) => (
                                <FileInput
                                  accept=".pdb"
                                  clearable
                                  description="PDB format"
                                  error={fieldState.error?.message}
                                  label="Structure"
                                  onChange={(val) => onChange(val ?? undefined)}
                                  placeholder="Upload ligand PDB file"
                                  ref={ref}
                                  value={value}
                                  withAsterisk
                                />
                              )}
                            />
                            <Controller
                              control={control}
                              name={`ligands.${index}.fileITP`}
                              render={({
                                field: { value, onChange, ref },
                                fieldState,
                              }) => (
                                <FileInput
                                  accept=".itp"
                                  clearable
                                  description="ITP format"
                                  error={fieldState.error?.message}
                                  label="Topology"
                                  onChange={(val) => onChange(val ?? undefined)}
                                  placeholder="Upload ligand ITP file"
                                  ref={ref}
                                  value={value}
                                  withAsterisk
                                />
                              )}
                            />
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Parameters */}
            <Box>
              <Title mb="xs" order={5}>
                Parameters
              </Title>
              <Stack gap="xs">
                <Group grow>
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
                </Group>
                <Group grow>
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
                        description="Range: 0.1 – 1.2 nm"
                        error={fieldState.error?.message}
                        fixedDecimalScale
                        label="Box Distance"
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
                        placeholder="0.1"
                        step={0.1}
                        value={value ?? undefined}
                      />
                    )}
                  />
                </Group>
              </Stack>
            </Box>

            <div className={classes.formButtons}>
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
                className={classes.formSubmitButton}
                leftSection={<IconPlayerPlay size={16} />}
                type="submit"
              >
                Run Simulation
              </Button>
            </div>
          </Stack>

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
