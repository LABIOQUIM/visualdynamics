import { Controller, type Control } from "react-hook-form";
import { Group, Radio, Text } from "@mantine/core";

import type { SimulationFormValues } from "./schema";
import classes from "../index.module.css";

interface Props {
  control: Control<SimulationFormValues>;
}

const options = [
  { value: "apo", label: "Free Protein", description: "Protein-only simulation" },
  { value: "acpype", label: "Protein + Ligand", description: "ACPYPE parameterization" },
] as const;

export function SimulationTypeSelector({ control }: Props) {
  return (
    <Controller
      control={control}
      name="type"
      render={({ field }) => (
        <Radio.Group onChange={field.onChange} value={field.value}>
          <Group grow>
            {options.map(({ value, label, description }) => (
              <Radio.Card
                key={value}
                className={classes.radioRoot}
                radius="md"
                value={value}
                withBorder
              >
                <Group gap="sm" wrap="nowrap">
                  <Radio.Indicator />
                  <div>
                    <Text fw={500} size="sm">{label}</Text>
                    <Text c="dimmed" size="xs">{description}</Text>
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
