import { type Control, Controller, type FormState } from "react-hook-form";
import { FileInput, Stack } from "@mantine/core";

import { LigandFields } from "./LigandFields";
import type { SimulationFormValues } from "./schema";

interface Props {
  control: Control<SimulationFormValues>;
  formState: FormState<SimulationFormValues>;
  isAcpype: boolean;
}

export function FilesSection({ control, formState, isAcpype }: Props) {
  return (
    <Stack gap="xs">
      <Controller
        control={control}
        name="filePDB"
        render={({ field: { value, onChange, ref }, fieldState }) => (
          <FileInput
            accept=".pdb"
            clearable
            description="PDB format"
            error={fieldState.error?.message}
            label="Protein"
            onChange={onChange}
            placeholder="Upload protein PDB file"
            ref={ref}
            value={value}
            withAsterisk
          />
        )}
      />
      {isAcpype && <LigandFields control={control} formState={formState} />}
    </Stack>
  );
}
