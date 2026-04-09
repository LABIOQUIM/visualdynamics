import classes from "./FlagForm.module.css";

import {
  Button,
  Group,
  JsonInput,
  Select,
  Stack,
  Switch,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";

import { type CreateFeatureFlagInput } from "@/mutations/featureFlags";

const FLAG_TYPE_OPTIONS = [
  { value: "BOOLEAN", label: "Boolean" },
  { value: "STRING", label: "String" },
  { value: "NUMBER", label: "Number" },
];

export interface FlagFormValues {
  key: string;
  type: CreateFeatureFlagInput["type"];
  enabled: boolean;
  defaultVariant: string;
  variants: string;
  description: string;
}

const DEFAULT_VALUES: FlagFormValues = {
  key: "",
  type: "BOOLEAN",
  enabled: true,
  defaultVariant: "on",
  variants: '{\n  "on": true,\n  "off": false\n}',
  description: "",
};

interface FlagFormProps {
  initialValues?: Partial<FlagFormValues>;
  disabledFields?: (keyof FlagFormValues)[];
  onSubmit: (values: FlagFormValues) => void;
  isLoading: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export function FlagForm({
  initialValues,
  disabledFields = [],
  onSubmit,
  isLoading,
  onCancel,
  submitLabel = "Save",
}: FlagFormProps) {
  const form = useForm<FlagFormValues>({
    initialValues: { ...DEFAULT_VALUES, ...initialValues },
    validate: {
      key: (v) => (!v.trim() ? "Key is required" : null),
      variants: (v) => {
        try {
          JSON.parse(v);
          return null;
        } catch {
          return "Invalid JSON";
        }
      },
    },
  });

  return (
    <form className={classes.form} onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          disabled={disabledFields.includes("key")}
          label="Key"
          placeholder="my-feature-flag"
          {...form.getInputProps("key")}
        />
        <Select
          data={FLAG_TYPE_OPTIONS}
          disabled={disabledFields.includes("type")}
          label="Type"
          {...form.getInputProps("type")}
        />
        <Switch
          label="Enabled"
          {...form.getInputProps("enabled", { type: "checkbox" })}
        />
        <TextInput
          label="Default Variant"
          {...form.getInputProps("defaultVariant")}
        />
        <JsonInput
          autosize
          formatOnBlur
          label="Variants (JSON)"
          minRows={4}
          {...form.getInputProps("variants")}
        />
        <TextInput
          label="Description"
          placeholder="Optional description"
          {...form.getInputProps("description")}
        />
        <Group>
          <Button loading={isLoading} type="submit">
            {submitLabel}
          </Button>
          <Button onClick={onCancel} variant="subtle">
            Cancel
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
