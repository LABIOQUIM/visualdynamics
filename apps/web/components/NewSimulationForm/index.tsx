"use client";
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
} from "@mantine/core";
import {
  IconAtom2,
  IconChevronDown,
  IconFileDownload,
  IconFileUpload,
} from "@tabler/icons-react";

import { Alert } from "../Alert";

import { boxTypes } from "./data/box-types";
import { allForceFields } from "./data/force-fields";
import { waterModels } from "./data/water-models";

import classes from "./NewSimulationForm.module.css";

interface Props {
  simulationType: SimulationType;
}

export function NewSimulationForm({ simulationType }: Props) {
  const forceFields = allForceFields[simulationType];

  return (
    <Box className={classes.container}>
      <FileInput
        label="Molecule (.pdb)"
        leftSection={<IconFileUpload />}
        placeholder="Click to select your molecule PDB file"
        size="lg"
      />

      {simulationType !== "apo" && (
        <Box className={classes.containerSideBySide}>
          <FileInput
            label="Ligand (.itp)"
            leftSection={<IconFileUpload />}
            placeholder="Click to select your ligand ITP file"
            size="lg"
          />
          <FileInput
            label="Ligand (.pdb)"
            leftSection={<IconFileUpload />}
            placeholder="Click to select your ligand PDB file"
            size="lg"
          />
        </Box>
      )}
      <Box className={classes.containerSideBySide}>
        <Autocomplete
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
        />
        <Autocomplete
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
        />
      </Box>
      <Box className={classes.containerSideBySide}>
        <Autocomplete
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
        />
        <NumberInput
          label="Box Distance (nm)"
          step={0.1}
          min={0.1}
          max={5}
          placeholder="Input a value"
          allowNegative={false}
          decimalScale={1}
          fixedDecimalScale
          size="lg"
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
        <Button leftSection={<IconFileDownload />} variant="default" size="lg">
          Generate Command List
        </Button>
        <Button leftSection={<IconAtom2 />} size="lg">
          Run Simulation
        </Button>
      </Box>
    </Box>
  );
}
