import classes from "./FileStep.module.css";

import { Box, Button, FileInput, Group, Radio, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useState } from "preact/hooks";

import { simulationTypeRadioData } from "./constants";
import { useSimulationSubmitFormContext } from "./FormContext";

import { ThreeDViewer } from "@/components/ThreeDViewer/ThreeDViewer";
import type { LatestMacromolecules } from "@/queries/latestMacromolecules";

type Props = {
  next(): void;
};

export function SimulationSubmitFileStep({ next }: Props) {
  const [files, setFiles] = useState<LatestMacromolecules | undefined>();
  const [showLigandFields, setShowLigandFields] = useState(false);
  const form = useSimulationSubmitFormContext();

  async function validateFilePDB(value: File | null | undefined) {
    if (!value) {
      return "PDB file is required";
    }

    const text = await value.text();

    if (!text.includes("ATOM") && !text.includes("HETATM")) {
      return "Invalid PDB file";
    }

    return true;
  }

  form.watch("filePDB", async ({ value }) => {
    if (value) {
      const pdbText = await value.text();

      setFiles((prev) => ({
        ...prev,
        macromolecule: pdbText,
      }));
    } else {
      setFiles((prev) => ({
        ...prev,
        macromolecule: "",
      }));
    }
  });

  form.watch("fileLigandPDB", async ({ value }) => {
    if (value) {
      const pdbText = await value.text();

      setFiles((prev) => ({
        macromolecule: prev ? prev.macromolecule : "",
        ligandPdb: pdbText,
      }));
    } else {
      setFiles((prev) => ({
        macromolecule: prev ? prev.macromolecule : "",
        ligandPdb: undefined,
      }));
    }
  });

  form.watch("type", ({ value }) => {
    if (value === "acpype") {
      setShowLigandFields(true);
    } else {
      setShowLigandFields(false);
    }
  });

  async function onNext() {
    const values = form.getValues();

    if (!values.type) {
      form.setFieldError("type", "Simulation type is required");
      return;
    }

    const validProtein = await validateFilePDB(values.filePDB);

    if (typeof validProtein === "string") {
      form.setFieldError("filePDB", validProtein);
      return;
    }

    if (values.type === "acpype") {
      const validLigandPDB = await validateFilePDB(values.fileLigandPDB);

      if (typeof validLigandPDB === "string") {
        form.setFieldError("fileLigandPDB", validLigandPDB);
        return;
      }

      if (!values.fileLigandITP) {
        form.setFieldError("fileLigandITP", "ITP file is required");
        return;
      }
    }

    next();
  }

  return (
    <Box className={classes.container}>
      <Radio.Group
        key={form.key("type")}
        label="Simulation Type"
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
                  <Text className={classes.radioLabel}>{item.name}</Text>
                  <Text className={classes.radioDescription}>
                    {item.description}
                  </Text>
                </div>
              </Group>
            </Radio.Card>
          ))}
        </Group>
      </Radio.Group>
      {form.getValues().type && (
        <>
          <Box className={classes.inputContainer}>
            <FileInput
              accept=".pdb"
              clearable
              key={form.key("filePDB")}
              label="Protein"
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
          </Box>
          <ThreeDViewer macromolecules={files} />
          <Button
            onClick={onNext}
            rightSection={<IconArrowRight />}
            type="button"
          >
            Next
          </Button>
        </>
      )}
    </Box>
  );
}
