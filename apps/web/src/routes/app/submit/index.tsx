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
import {
  IconChevronDown,
  IconDownload,
  IconInfoCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "preact/hooks";

import {
  SimulationSubmitFormProvider,
  type SimulationSubmitFormValues,
  useSimulationSubmitForm,
} from "./-components/FormContext";
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
  const [showLigandFields, setShowLigandFields] = useState(false);
  const [simulationType, setSimulationType] = useState<
    SIMULATION_TYPE | undefined
  >();

  const form = useSimulationSubmitForm({ mode: "uncontrolled" });

  const forceFields = simulationType
    ? allForceFields[simulationType]
    : allForceFields.apo;

  const selectDropdownStyles = {
    dropdown: { maxHeight: 200, overflowY: "auto" as const },
  };

  function renderSelectOption(
    data: Record<string, string>,
    value: string,
  ) {
    return (
      <Box>
        <Text c="dimmed" size="xs">
          {value}
        </Text>
        <Text size="sm">{data[value]}</Text>
      </Box>
    );
  }

  form.watch("type", ({ value }) => {
    setSimulationType(value as SIMULATION_TYPE);
    setShowLigandFields(value === "acpype");
  });

  form.watch("filePDB", async ({ value }) => {
    if (value) {
      const pdbText = await value.text();
      setFiles((prev) => ({ ...prev, macromolecule: pdbText }));
    } else {
      setFiles((prev) => ({ ...prev, macromolecule: "" }));
    }
  });

  form.watch("fileLigandPDB", async ({ value }) => {
    if (value) {
      const pdbText = await value.text();
      setFiles((prev) => ({ ...prev, ligandPdb: pdbText }));
    } else {
      setFiles((prev) => ({ ...prev, ligandPdb: undefined }));
    }
  });

  async function onDownloadCommands() {
    await submitSimulation(form.getValues(), false);
  }

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

  async function onSubmit(values: SimulationSubmitFormValues) {
    await submitSimulation(values, true);
  }

  return (
    <PageLayout>
      <Heading title="Submit Simulation" />
      <SimulationSubmitFormProvider form={form}>
        <form className={classes.form} onSubmit={form.onSubmit(onSubmit)}>
          <div className={classes.layout}>
            <Stack className={classes.formColumn} gap="md">
              <Box>
                <Title mb="xs" order={5}>
                  Simulation Type
                </Title>
                <Radio.Group
                  key={form.key("type")}
                  withAsterisk
                  {...form.getInputProps("type")}
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
              </Box>

              <Box>
                <Title mb="xs" order={5}>
                  Files
                </Title>
                <Stack gap="xs">
                  <FileInput
                    accept=".pdb"
                    clearable
                    key={form.key("filePDB")}
                    label="Protein (PDB)"
                    placeholder="Upload Protein PDB file"
                    withAsterisk
                    {...form.getInputProps("filePDB")}
                  />
                  {showLigandFields && (
                    <>
                      <FileInput
                        accept=".pdb"
                        clearable
                        key={form.key("fileLigandPDB")}
                        label="Ligand (PDB)"
                        placeholder="Upload Ligand PDB file"
                        withAsterisk
                        {...form.getInputProps("fileLigandPDB")}
                      />
                      <FileInput
                        accept=".itp"
                        clearable
                        key={form.key("fileLigandITP")}
                        label="Ligand (ITP)"
                        placeholder="Upload Ligand ITP file"
                        withAsterisk
                        {...form.getInputProps("fileLigandITP")}
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
                  <Select
                    data={Object.keys(forceFields)}
                    label="Force Field"
                    placeholder="Select a force field"
                    renderOption={({ option }) =>
                      renderSelectOption(forceFields, option.value)
                    }
                    rightSection={<IconChevronDown />}
                    searchable
                    styles={selectDropdownStyles}
                    withScrollArea={false}
                    {...form.getInputProps("forceField")}
                  />
                  <Select
                    data={Object.keys(waterModels)}
                    label="Water Model"
                    placeholder="Select a water model"
                    renderOption={({ option }) =>
                      renderSelectOption(waterModels, option.value)
                    }
                    rightSection={<IconChevronDown />}
                    searchable
                    styles={selectDropdownStyles}
                    withScrollArea={false}
                    {...form.getInputProps("waterModel")}
                  />
                  <Select
                    data={Object.keys(boxTypes)}
                    label="Box Type"
                    placeholder="Select a box type"
                    renderOption={({ option }) =>
                      renderSelectOption(boxTypes, option.value)
                    }
                    rightSection={<IconChevronDown />}
                    searchable
                    styles={selectDropdownStyles}
                    withScrollArea={false}
                    {...form.getInputProps("boxType")}
                  />
                  <NumberInput
                    allowNegative={false}
                    decimalScale={1}
                    fixedDecimalScale
                    label="Box Distance (nm)"
                    max={1.2}
                    min={0.1}
                    placeholder="Input a value"
                    step={0.1}
                    {...form.getInputProps("boxDistance")}
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
      </SimulationSubmitFormProvider>
    </PageLayout>
  );
}
