import classes from "../index.module.css";

import { useEffect, useRef } from "react";
import {
  type Control,
  Controller,
  type FormState,
  useFieldArray,
} from "react-hook-form";
import {
  ActionIcon,
  Box,
  Button,
  FileInput,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useFlag } from "@openfeature/react-sdk";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import type { SimulationFormValues } from "./schema";

interface Props {
  control: Control<SimulationFormValues>;
  formState: FormState<SimulationFormValues>;
}

export function LigandFields({ control, formState }: Props) {
  const { value: maxLigands } = useFlag("simulation-max-ligands", 1);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ligands",
  });
  const didAutoAdd = useRef(false);
  const atLimit = fields.length >= maxLigands;

  // Auto-add the first ligand when this section first appears
  useEffect(() => {
    if (!didAutoAdd.current && fields.length === 0) {
      didAutoAdd.current = true;
      append({
        filePDB: undefined as unknown as File,
        fileITP: undefined as unknown as File,
      });
    }
  }, [fields.length, append]);

  function addLigand() {
    append({
      filePDB: undefined as unknown as File,
      fileITP: undefined as unknown as File,
    });
  }

  return (
    <Box>
      <Group align="center" justify="space-between" mb="xs">
        <Title order={6}>Ligands</Title>
        <Group gap="xs">
          <Text
            c={atLimit ? "orange" : "dimmed"}
            size="xs"
            style={{ visibility: fields.length > 0 ? "visible" : "hidden" }}
          >
            {fields.length}/{maxLigands}
          </Text>
          <Button
            disabled={atLimit}
            leftSection={<IconPlus size={14} />}
            onClick={addLigand}
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
        {fields.map((field, index) => (
          <Paper key={field.id} p="sm" radius="sm" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">
                Ligand {index + 1}
              </Text>
              <ActionIcon
                color="red"
                onClick={() => remove(index)}
                size="sm"
                variant="subtle"
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
            <div className={classes.fieldGrid}>
              <Controller
                control={control}
                name={`ligands.${index}.filePDB`}
                render={({ field: { value, onChange, ref }, fieldState }) => (
                  <FileInput
                    accept=".pdb"
                    clearable
                    description="PDB format"
                    {...(fieldState.error?.message ? { error: fieldState.error.message } : {})}
                    label="Structure"
                    onChange={(val) => onChange(val ?? undefined)}
                    placeholder="Upload ligand PDB file"
                    ref={ref}
                    value={value ?? null}
                    withAsterisk
                  />
                )}
              />
              <Controller
                control={control}
                name={`ligands.${index}.fileITP`}
                render={({ field: { value, onChange, ref }, fieldState }) => (
                  <FileInput
                    accept=".itp"
                    clearable
                    description="ITP format"
                    {...(fieldState.error?.message ? { error: fieldState.error.message } : {})}
                    label="Topology"
                    onChange={(val) => onChange(val ?? undefined)}
                    placeholder="Upload ligand ITP file"
                    ref={ref}
                    value={value ?? null}
                    withAsterisk
                  />
                )}
              />
            </div>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
