"use client";
import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  ComboboxItem,
  FileInput,
  Input,
  NumberInput,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { render } from "@react-email/components";
import {
  IconAlertTriangle,
  IconAtom2,
  IconCheck,
  IconChevronDown,
  IconClockPause,
  IconFileDownload,
  IconFileUpload,
  IconFileZip,
  IconX,
} from "@tabler/icons-react";
import { SIMULATION_TYPE } from "database";
import { useRouter } from "next/navigation";

import { getMDPFiles } from "@/actions/simulation/getMDPFiles";
import { submitNewSimulation } from "@/actions/simulation/submitNewSimulation";
import { RouteLinks } from "@/app/_constants/routes";
import { Alert } from "@/components/Alerts/Alert";
import SimulationCompletedEmail from "@/emails/simulation/Completed";
import SimulationErroredEmail from "@/emails/simulation/Errored";
import { useAuth } from "@/hooks/auth/useAuth";
import { useSettings } from "@/hooks/utils/useSettings";

import { boxTypes } from "./data/box-types";
import { allForceFields } from "./data/force-fields";
import { waterModels } from "./data/water-models";

import classes from "./NewSimulationForm.module.css";

interface Props {
  simulationType: SIMULATION_TYPE;
}

interface FormProps {
  filePDB: File;
  fileLigandITP?: File;
  fileLigandPDB?: File;
  forceField: keyof typeof allForceFields;
  waterModel: keyof typeof waterModels;
  boxType: keyof typeof boxTypes;
  boxDistance: string;
}

export function NewSimulationForm({ simulationType }: Props) {
  const { data: auth } = useAuth();
  const forceFields = allForceFields[simulationType];
  const [isLoading, setIsLoading] = useState<boolean>();
  const { getInputProps, onSubmit, values, validate } = useForm<FormProps>({
    validate: {
      boxDistance(value) {
        if (isNaN(Number(value))) {
          return "Must be a number.";
        }
        if (Number(value) < 0.1) {
          return "Must be greater than 0.";
        }
        if (Number(value) > 2) {
          return "Must be smaller than 2.";
        }
        return null;
      },
      boxType(value) {
        if (!Object.keys(boxTypes).includes(value)) {
          return "Invalid Box Type.";
        }

        return null;
      },
      fileLigandITP(value) {
        if (!value && simulationType !== "apo") {
          return "Must provide a Ligand ITP file";
        }

        return null;
      },
      fileLigandPDB(value) {
        if (!value && simulationType !== "apo") {
          return "Must provide a Ligand PDB file.";
        }

        return null;
      },
      filePDB(value) {
        if (!value) {
          return "Must provide a Protein PDB file.";
        }

        return null;
      },
      forceField(value) {
        if (!Object.keys(forceFields).includes(value)) {
          return "Invalid Force Field.";
        }

        return null;
      },
      waterModel(value) {
        if (!Object.keys(waterModels).includes(value)) {
          return "Invalid Water Model.";
        }

        return null;
      },
    },
  });
  const router = useRouter();

  const { data: settings } = useSettings("visualdynamics");

  const getFormData = () => {
    const data = new FormData();
    data.append("filePDB", values.filePDB);
    if (simulationType !== "apo") {
      data.append("fileLigandITP", values.fileLigandITP!);
      data.append("fileLigandPDB", values.fileLigandPDB!);
    }
    data.append("forceField", values.forceField);
    data.append("waterModel", values.waterModel);
    data.append("boxType", values.boxType);
    data.append("boxDistance", values.boxDistance);

    return data;
  };

  const onSubmitSimulation = async (shouldRun?: boolean) => {
    if (validate().hasErrors) {
      return;
    }
    setIsLoading(true);
    const data = getFormData();

    if (shouldRun) {
      data.append("shouldRun", "true");
      data.append(
        "successEmail",
        await render(
          <SimulationCompletedEmail
            email={auth?.user?.email || ""}
            firstName={auth?.user?.firstName || ""}
            platformURL={window.location.href || ""}
          />
        )
      );
      data.append(
        "errorEmail",
        await render(
          <SimulationErroredEmail
            email={auth?.user?.email || ""}
            firstName={auth?.user?.firstName || ""}
            platformURL={window.location.href || ""}
          />
        )
      );
    }

    const response = await submitNewSimulation(data, simulationType);

    if (response.status === "added-to-queue") {
      notifications.show({
        title: "Simulation queued!",
        message: "Your simulation has been set up and should start soon.",
        color: "green",
        icon: <IconClockPause />,
        withBorder: true,
      });

      router.push(
        `${RouteLinks.SIMULATIONS}?details=${simulationType}&tab=run`
      );
    } else if (response.status === "unauthenticated") {
      notifications.show({
        title: "Unauthenticated!",
        message:
          "For some reason you are not authenticated. You can't start a simulation in that state.",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
      router.replace(`${RouteLinks.LOGIN}?from=unauthenticated`);
    } else if (response.status === "queued-or-running") {
      notifications.show({
        title: "Simulation queued or running!",
        message: "You have a simulation in our workers already.",
        color: "orange",
        icon: <IconAlertTriangle />,
        withBorder: true,
      });

      router.push(
        `${RouteLinks.SIMULATIONS}?details=${simulationType}&tab=run`
      );
    } else if (response.status === "unknown-error") {
      notifications.show({
        title: "Something went wrong!",
        message: "It was not possible to set up your simulation at this time.",
        color: "red",
        icon: <IconX />,
        withBorder: true,
      });
    } else {
      let filename = simulationType;
      filename += `-${values.filePDB.name.split(".")[0]}`;

      if (values.fileLigandITP) {
        filename += `-${values.fileLigandITP.name.split(".")[0]}`;
      }

      if (values.fileLigandPDB) {
        filename += `-${values.fileLigandPDB.name.split(".")[0]}`;
      }

      filename += "-commands.txt";

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," +
          encodeURIComponent(response.commands.join(""))
      );
      element.setAttribute("download", filename);

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);

      notifications.show({
        title: "Commands downloaded!",
        message: "Your simulation commands have been generated and downloaded.",
        color: "green",
        icon: <IconCheck />,
        withBorder: true,
      });
    }
    setIsLoading(false);
  };

  const onSubmitRun = () => {
    onSubmitSimulation(true);
  };

  async function handleDownloadMDPFiles() {
    setIsLoading(true);
    const data = await getMDPFiles();
    const link = document.createElement("a");
    link.download = `visualdynamics-mdpfiles.zip`;
    const blobUrl = window.URL.createObjectURL(
      new Blob([new Uint8Array(Buffer.from(data, "base64"))])
    );

    link.href = blobUrl;
    link.click();
    window.URL.revokeObjectURL(blobUrl);
    setIsLoading(false);
  }

  if (settings === "error" || settings === "unauthenticated") {
    return "Failed to load settings";
  }

  if (settings?.systemMode === "MAINTENANCE") {
    return (
      <Box className={classes.containerDownOrMaintenance}>
        <IconAlertTriangle size={48} />
        <Title order={3}>
          Visual Dynamics is currently down for maintenance.
        </Title>
      </Box>
    );
  }

  if (settings?.systemMode === "DOWN") {
    return (
      <Box className={classes.containerDownOrMaintenance}>
        <IconAlertTriangle size={48} />
        <Title order={3}>Visual Dynamics is currently down.</Title>
      </Box>
    );
  }

  return (
    <Box
      className={classes.container}
      component="form"
      onSubmit={onSubmit(onSubmitRun)}
    >
      <FileInput
        disabled={isLoading}
        label="Macromolecule (.pdb)"
        leftSection={<IconFileUpload />}
        placeholder="Click to select your PDB file"
        size="lg"
        accept=".pdb,.PDB"
        {...getInputProps("filePDB")}
      />

      {simulationType !== "apo" && (
        <Box className={classes.containerSideBySide}>
          <FileInput
            disabled={isLoading}
            label="Ligand (.itp)"
            leftSection={<IconFileUpload />}
            placeholder="Click to select your ligand ITP file"
            size="lg"
            accept=".itp,.ITP"
            {...getInputProps("fileLigandITP")}
          />
          <FileInput
            disabled={isLoading}
            label="Ligand (.pdb)"
            leftSection={<IconFileUpload />}
            placeholder="Click to select your ligand PDB file"
            size="lg"
            accept=".pdb,.PDB"
            {...getInputProps("fileLigandPDB")}
          />
        </Box>
      )}
      <Box className={classes.containerSideBySide}>
        <Autocomplete
          disabled={isLoading}
          label="Force Field"
          placeholder="What force field to apply"
          data={Object.keys(forceFields)}
          size="lg"
          rightSection={<IconChevronDown />}
          withScrollArea={false}
          styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
          filter={({ options, search }) => {
            const splittedSearch = search.toLowerCase().trim().split(" ");
            return (options as ComboboxItem[]).filter((option) => {
              const words = (
                forceFields[option.label as keyof typeof forceFields] as string
              )
                .toLowerCase()
                .trim()
                .split(" ");
              return (
                splittedSearch.every((searchWord) =>
                  words.some((word) => word.includes(searchWord))
                ) || option.value.includes(search)
              );
            });
          }}
          renderOption={({ option }) => (
            <Box className={classes.autocompleteItemContainer}>
              <Text size="sm" opacity={0.5}>
                {option.value}
              </Text>
              <Text>
                {forceFields[option.value as keyof typeof forceFields]}
              </Text>
            </Box>
          )}
          {...getInputProps("forceField")}
        />
        <Autocomplete
          disabled={isLoading}
          label="Water Model"
          placeholder="What water model to apply"
          data={Object.keys(waterModels)}
          size="lg"
          rightSection={<IconChevronDown />}
          withScrollArea={false}
          styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
          filter={({ options, search }) => {
            const splittedSearch = search.toLowerCase().trim().split(" ");
            return (options as ComboboxItem[]).filter((option) => {
              const words = (
                waterModels[option.label as keyof typeof waterModels] as string
              )
                .toLowerCase()
                .trim()
                .split(" ");
              return (
                splittedSearch.every((searchWord) =>
                  words.some((word) => word.includes(searchWord))
                ) || option.value.includes(search)
              );
            });
          }}
          renderOption={({ option }) => (
            <Box className={classes.autocompleteItemContainer}>
              <Text size="sm" opacity={0.5}>
                {option.value}
              </Text>
              <Text>
                {waterModels[option.value as keyof typeof waterModels]}
              </Text>
            </Box>
          )}
          {...getInputProps("waterModel")}
        />
      </Box>
      <Box className={classes.containerSideBySide}>
        <Autocomplete
          disabled={isLoading}
          label="Box Type"
          placeholder="What type of box to use"
          data={Object.keys(boxTypes)}
          size="lg"
          rightSection={<IconChevronDown />}
          withScrollArea={false}
          styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
          filter={({ options, search }) => {
            const splittedSearch = search.toLowerCase().trim().split(" ");
            return (options as ComboboxItem[]).filter((option) => {
              const words = (
                boxTypes[option.label as keyof typeof boxTypes] as string
              )
                .toLowerCase()
                .trim()
                .split(" ");
              return (
                splittedSearch.every((searchWord) =>
                  words.some((word) => word.includes(searchWord))
                ) || option.value.includes(search)
              );
            });
          }}
          renderOption={({ option }) => (
            <Box className={classes.autocompleteItemContainer}>
              <Text size="sm" opacity={0.5}>
                {option.value}
              </Text>
              <Text>{boxTypes[option.value as keyof typeof boxTypes]}</Text>
            </Box>
          )}
          {...getInputProps("boxType")}
        />
        <NumberInput
          disabled={isLoading}
          label="Box Distance (nm)"
          step={0.1}
          min={0.1}
          max={1.2}
          placeholder="Input a value"
          allowNegative={false}
          decimalScale={1}
          fixedDecimalScale
          size="lg"
          {...getInputProps("boxDistance")}
        />
      </Box>
      <Box className={classes.containerSideBySide}>
        <TextInput disabled label="Simulation Time" value="5ns" size="lg" />

        <Input.Wrapper label="Note" size="lg">
          <Alert
            className={classes.customAlert}
            status={{
              status: "info",
              title:
                "Is 5ns too little? Contact us via fernando.zanchi@fiocruz.br",
            }}
          />
        </Input.Wrapper>
      </Box>
      <Box className={classes.containerOptions}>
        <Switch
          defaultChecked
          disabled
          label="Neutralize System"
          onLabel="ON"
          offLabel="OFF"
          size="lg"
        />
        <Switch
          defaultChecked
          disabled
          label="Ignore Hydrogens"
          onLabel="ON"
          offLabel="OFF"
          size="lg"
        />
      </Box>
      <Box className={classes.containerSideBySide}>
        <Button
          disabled={isLoading}
          leftSection={<IconFileDownload />}
          onClick={() => onSubmitSimulation(false)}
          variant="default"
          size="lg"
          type="button"
        >
          Generate Command List
        </Button>
        <Button
          disabled={isLoading}
          leftSection={<IconAtom2 />}
          size="lg"
          type="submit"
        >
          Run Simulation
        </Button>
        <Button
          disabled={isLoading}
          leftSection={<IconFileZip />}
          onClick={handleDownloadMDPFiles}
          variant="default"
          size="lg"
          type="button"
        >
          Download MDP Files
        </Button>
      </Box>
    </Box>
  );
}
