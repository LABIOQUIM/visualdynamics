import classes from "./ParamsStep.module.css";

import { Box, Button, NumberInput, Select, Switch, Text } from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronDown,
} from "@tabler/icons-react";

import { allForceFields, boxTypes, waterModels } from "./constants";
import { useSimulationSubmitFormContext } from "./FormContext";

type Props = {
  next(): void;
  prev(): void;
};

export function SimulationSubmitParamsStep({ next, prev }: Props) {
  const form = useSimulationSubmitFormContext();

  const simulationType = form.values.type;

  const forceFields = allForceFields[simulationType];

  async function onNext() {
    const values = form.getValues();

    if (!values.forceField) {
      form.setFieldError("forceField", "Force field is required");
      return;
    }

    if (!values.waterModel) {
      form.setFieldError("waterModel", "Water model is required");
      return;
    }

    if (!values.boxType) {
      form.setFieldError("boxType", "Box type is required");
      return;
    }

    if (!values.boxDistance) {
      form.setFieldError("boxDistance", "Box distance is required");
      return;
    }

    next();
  }

  return (
    <Box className={classes.container}>
      <Select
        data={Object.keys(forceFields)}
        label="Force Field"
        placeholder="What force field to apply"
        renderOption={({ option }) => (
          <Box className={classes.autocompleteItemContainer}>
            <Text opacity={0.5} size="sm">
              {option.value}
            </Text>
            <Text>{forceFields[option.value as keyof typeof forceFields]}</Text>
          </Box>
        )}
        rightSection={<IconChevronDown />}
        searchable
        styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
        withScrollArea={false}
        {...form.getInputProps("forceField")}
      />
      <Select
        data={Object.keys(waterModels)}
        label="Water Model"
        placeholder="What water model to apply"
        renderOption={({ option }) => (
          <Box className={classes.autocompleteItemContainer}>
            <Text opacity={0.5} size="sm">
              {option.value}
            </Text>
            <Text>{waterModels[option.value as keyof typeof waterModels]}</Text>
          </Box>
        )}
        rightSection={<IconChevronDown />}
        searchable
        styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
        withScrollArea={false}
        {...form.getInputProps("waterModel")}
      />
      <Select
        data={Object.keys(boxTypes)}
        label="Box Type"
        placeholder="What type of box to use"
        renderOption={({ option }) => (
          <Box className={classes.autocompleteItemContainer}>
            <Text opacity={0.5} size="sm">
              {option.value}
            </Text>
            <Text>{boxTypes[option.value as keyof typeof boxTypes]}</Text>
          </Box>
        )}
        rightSection={<IconChevronDown />}
        searchable
        styles={{ dropdown: { maxHeight: 200, overflowY: "auto" } }}
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

      <Switch
        defaultChecked
        disabled
        label="Neutralize System"
        offLabel="OFF"
        onLabel="ON"
      />
      <Switch
        defaultChecked
        disabled
        label="Ignore Hydrogens"
        offLabel="OFF"
        onLabel="ON"
      />

      <Box className={classes.buttonContainer}>
        <Button
          leftSection={<IconArrowLeft />}
          onClick={prev}
          type="button"
          variant="subtle"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          rightSection={<IconArrowRight />}
          type="button"
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}
