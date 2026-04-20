import classes from "./FlagForm.module.css";

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import { type CreateFeatureFlagInput } from "@/mutations/featureFlags";

import { VariantValueInput } from "./VariantValueInput";

const FLAG_TYPE_OPTIONS = [
  { value: "BOOLEAN", label: "Boolean" },
  { value: "STRING", label: "String" },
  { value: "NUMBER", label: "Number" },
];

const FLAG_TYPE_COLORS: Record<string, string> = {
  BOOLEAN: "teal",
  STRING: "blue",
  NUMBER: "orange",
};

export interface VariantEntry {
  variantKey: string;
  variantValue: string;
}

export interface FlagFormValues {
  key: string;
  type: CreateFeatureFlagInput["type"];
  enabled: boolean;
  defaultVariant: string;
  variants: VariantEntry[];
  description: string;
}

const DEFAULT_VALUES: FlagFormValues = {
  key: "",
  type: "BOOLEAN",
  enabled: true,
  defaultVariant: "on",
  variants: [
    { variantKey: "on", variantValue: "true" },
    { variantKey: "off", variantValue: "false" },
  ],
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
      variants: {
        variantKey: (v: string, values: FlagFormValues, path: string) => {
          if (!v.trim()) return "Key is required";
          const index = Number(path.split(".")[1]);
          const isDuplicate = values.variants.some(
            (e, i) => i !== index && e.variantKey === v,
          );
          return isDuplicate ? "Variant keys must be unique" : null;
        },
      },
    },
  });

  const { values } = form;

  const variantKeyOptions = Array.from(
    new Map(
      values.variants
        .filter((e) => e.variantKey.trim())
        .map((e) => [
          e.variantKey,
          { value: e.variantKey, label: e.variantKey },
        ]),
    ).values(),
  );

  function addVariant() {
    form.insertListItem("variants", {
      variantKey: "",
      variantValue: values.type === "BOOLEAN" ? "true" : "",
    });
  }

  function removeVariant(index: number) {
    form.removeListItem("variants", index);
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <div className={classes.grid}>
        <Paper p="md" withBorder>
          <Stack>
            <Group justify="space-between">
              <Title order={5}>Variants</Title>
              <Badge
                color={FLAG_TYPE_COLORS[values.type] ?? "gray"}
                variant="light"
              >
                {values.type}
              </Badge>
            </Group>

            {values.variants.length === 0 ? (
              <Text c="dimmed" size="sm">
                No variants yet. Add one below.
              </Text>
            ) : (
              <>
                <div className={classes.variantHeader}>
                  <Text c="dimmed" size="xs">
                    Key
                  </Text>
                  <Text c="dimmed" size="xs">
                    Value
                  </Text>
                  <div />
                </div>

                {values.variants.map((entry, index) => (
                  <div className={classes.variantRow} key={index}>
                    <TextInput
                      error={
                        form.errors[`variants.${index}.variantKey`] as
                          | string
                          | undefined
                      }
                      placeholder="variant-key"
                      {...form.getInputProps(`variants.${index}.variantKey`)}
                    />
                    <VariantValueInput
                      entry={entry}
                      onChange={(v) =>
                        form.setFieldValue(`variants.${index}.variantValue`, v)
                      }
                      type={values.type}
                    />
                    <ActionIcon
                      color="red"
                      onClick={() => removeVariant(index)}
                      variant="subtle"
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </div>
                ))}
              </>
            )}

            <Button
              leftSection={<IconPlus size={14} />}
              onClick={addVariant}
              size="sm"
              variant="light"
            >
              Add Variant
            </Button>
          </Stack>
        </Paper>

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
          <Select
            data={variantKeyOptions}
            label="Default Variant"
            placeholder="Select a variant"
            {...form.getInputProps("defaultVariant")}
          />
          <Switch
            label="Enabled"
            {...form.getInputProps("enabled", { type: "checkbox" })}
          />
          <TextInput
            label="Description"
            placeholder="Optional description"
            {...form.getInputProps("description")}
          />
          <Group mt="md">
            <Button loading={isLoading} type="submit">
              {submitLabel}
            </Button>
            <Button onClick={onCancel} variant="subtle">
              Cancel
            </Button>
          </Group>
        </Stack>
      </div>
    </form>
  );
}
