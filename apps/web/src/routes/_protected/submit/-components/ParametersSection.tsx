import classes from "../index.module.css";

import { type Control, Controller, useWatch } from "react-hook-form";
import { Box, NumberInput, Select, Stack, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

import { allForceFields, boxTypes, waterModels } from "./constants";
import type { SimulationFormValues } from "./schema";
import { SectionContainer } from "./SectionContainer";

const dropdownStyles = {
  dropdown: { maxHeight: 200, overflowY: "auto" as const },
};

function renderOption(data: Record<string, string>, value: string) {
  return (
    <Box>
      <Text c="dimmed" size="xs">
        {value}
      </Text>
      <Text size="sm">{data[value]}</Text>
    </Box>
  );
}

interface Props {
  control: Control<SimulationFormValues>;
}

export function ParametersSection({ control }: Props) {
  const simulationType = useWatch({ control, name: "type" });
  const isAcpype = simulationType === "acpype";
  const forceFields = isAcpype ? allForceFields.acpype : allForceFields.apo;
  return (
    <SectionContainer title="Parameters">
      <Stack gap="xs">
        <div className={classes.fieldGrid}>
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
                  renderOption(forceFields, option.value)
                }
                rightSection={<IconChevronDown />}
                searchable
                styles={dropdownStyles}
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
                  renderOption(waterModels, option.value)
                }
                rightSection={<IconChevronDown />}
                searchable
                styles={dropdownStyles}
                value={field.value}
                withScrollArea={false}
              />
            )}
          />
        </div>
        <div className={classes.fieldGrid}>
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
                  renderOption(boxTypes, option.value)
                }
                rightSection={<IconChevronDown />}
                searchable
                styles={dropdownStyles}
                value={field.value}
                withScrollArea={false}
              />
            )}
          />
          <Controller
            control={control}
            name="boxDistance"
            render={({ field: { value, onChange, ...field }, fieldState }) => (
              <NumberInput
                {...field}
                allowNegative={false}
                decimalScale={1}
                error={fieldState.error?.message}
                fixedDecimalScale
                label="Box Distance"
                max={1.2}
                min={0.1}
                onChange={(val) => {
                  if (val === "" || val === null || val === undefined) {
                    onChange(undefined);
                  } else if (typeof val === "number") {
                    onChange(val);
                  } else {
                    const n = Number(val);
                    onChange(Number.isNaN(n) ? undefined : n);
                  }
                }}
                placeholder="0.1"
                step={0.1}
                value={value ?? undefined}
              />
            )}
          />
        </div>
      </Stack>
    </SectionContainer>
  );
}
