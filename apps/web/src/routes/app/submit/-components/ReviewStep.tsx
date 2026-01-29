import classes from "./ReviewStep.module.css";

import { Blockquote, Box, Button, Text } from "@mantine/core";
import {
  IconArrowLeft,
  IconInfoCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { useEffect, useState } from "preact/hooks";

import { useSimulationSubmitFormContext } from "./FormContext";

import { ThreeDViewer } from "@/components/ThreeDViewer/ThreeDViewer";
import { submitSimulation } from "@/mutations/submitSimulation";
import type { LatestMacromolecules } from "@/queries/latestMacromolecules";

type Props = {
  prev(): void;
};

export function ReviewStep({ prev }: Props) {
  const [files, setFiles] = useState<LatestMacromolecules | undefined>();
  const form = useSimulationSubmitFormContext();
  const values = form.getValues();

  useEffect(() => {
    async function getMacromolecules() {
      const values = form.getValues();

      const macromolecule = await values.filePDB.text();
      const ligandPdb = await values.fileLigandPDB?.text();

      setFiles({
        macromolecule,
        ligandPdb,
      });
    }

    getMacromolecules();
  }, []);

  async function onDownloadCommands() {
    await submitSimulation(values, false);
  }

  function LabelValueText({ label, value }: { label: string; value: string }) {
    return (
      <Box className={classes.labelValueContainer}>
        <Text className={classes.label}>{label}:</Text>
        <Text>{value}</Text>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.dataContainer}>
        <Box>
          <LabelValueText label="Macromolecule" value={values.filePDB.name} />
          {values.fileLigandPDB && (
            <LabelValueText
              label="Ligand PDB"
              value={values.fileLigandPDB.name}
            />
          )}
          {values.fileLigandITP && (
            <LabelValueText
              label="Ligand ITP"
              value={values.fileLigandITP.name}
            />
          )}
          <LabelValueText label="Force Field" value={values.forceField} />
          <LabelValueText label="Water Model" value={values.waterModel} />
          <LabelValueText label="Box Type" value={values.boxType} />
          <LabelValueText label="Box Distance" value={values.boxDistance} />
          <LabelValueText label="Simulation Time" value="5ns" />
          <Blockquote color="blue" icon={<IconInfoCircle />} mt="xl">
            If 5ns simulation time is not enough you can contact{" "}
            <a href="mailto:fernando.zanchi@fiocruz.br">
              fernando.zanchi@fiocruz.br
            </a>
          </Blockquote>
          <Button
            fullWidth
            mt="xs"
            onClick={onDownloadCommands}
            type="button"
            variant="light"
          >
            Download Commands
          </Button>
          <Button fullWidth mt="xs" type="button" variant="light">
            Download MDP Files
          </Button>
        </Box>
        <ThreeDViewer macromolecules={files} />
      </Box>

      <Box className={classes.buttonContainer}>
        <Button
          leftSection={<IconArrowLeft />}
          onClick={prev}
          type="button"
          variant="subtle"
        >
          Previous Step
        </Button>
        <Button rightSection={<IconPlayerPlay />} type="submit">
          Run Simulation
        </Button>
      </Box>
    </Box>
  );
}
