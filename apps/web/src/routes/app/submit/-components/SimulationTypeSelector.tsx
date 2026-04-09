import classes from "../index.module.css";

import { type Control, Controller } from "react-hook-form";
import { Group, Radio, Text } from "@mantine/core";

import type { SimulationFormValues } from "./schema";

interface Props {
  control: Control<SimulationFormValues>;
  onTypeChange: () => void;
}

const options = [
  {
    value: "apo",
    label: "Free Protein",
    description: "Protein-only simulation",
  },
  {
    value: "acpype",
    label: "Protein + Ligand",
    description: "ACPYPE parameterization",
  },
] as const;

export function SimulationTypeSelector({ control, onTypeChange }: Props) {
  return (
    <Controller
      control={control}
      name="type"
      render={({ field }) => (
        <Radio.Group
          onChange={(v) => {
            field.onChange(v);
            onTypeChange();
          }}
          value={field.value}
        >
          <Group grow>
            {options.map(({ value, label, description }) => (
              <Radio.Card
                className={classes.radioRoot}
                key={value}
                radius="md"
                value={value}
                withBorder
              >
                <Group gap="sm" wrap="nowrap">
                  <Radio.Indicator />
                  <div>
                    <Text fw={500} size="sm">
                      {label}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {description}
                    </Text>
                  </div>
                </Group>
              </Radio.Card>
            ))}
          </Group>
        </Radio.Group>
      )}
    />
  );
}
