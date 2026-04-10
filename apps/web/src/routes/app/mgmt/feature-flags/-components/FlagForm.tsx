import {
  ActionIcon,
  Badge,
  Button,
  Grid,
  Group,
  NumberInput,
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
        .map((e) => [e.variantKey, { value: e.variantKey, label: e.variantKey }]),
    ).values(),
  );

  function addVariant() {
    const defaultVal = values.type === "BOOLEAN" ? "true" : "";
    form.insertListItem("variants", {
      variantKey: "",
      variantValue: defaultVal,
    });
  }

  function removeVariant(index: number) {
    form.removeListItem("variants", index);
  }

  function renderValueInput(index: number, entry: VariantEntry) {
    if (values.type === "BOOLEAN") {
      return (
        <Switch
          checked={entry.variantValue === "true"}
          label={entry.variantValue === "true" ? "true" : "false"}
          onChange={(e) =>
            form.setFieldValue(
              `variants.${index}.variantValue`,
              e.currentTarget.checked ? "true" : "false",
            )
          }
        />
      );
    }

    if (values.type === "NUMBER") {
      const numVal = Number(entry.variantValue);
      return (
        <NumberInput
          placeholder="0"
          value={Number.isNaN(numVal) ? "" : numVal}
          onChange={(v) =>
            form.setFieldValue(`variants.${index}.variantValue`, String(v))
          }
        />
      );
    }

    return (
      <TextInput
        placeholder="value"
        {...form.getInputProps(`variants.${index}.variantValue`)}
      />
    );
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Grid gutter="xl">
        {/* LEFT: Variants */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper h="100%" p="md" withBorder>
            <Stack>
              <Group justify="space-between">
                <Title order={5}>Variants</Title>
                <Badge color={FLAG_TYPE_COLORS[values.type] ?? "gray"} variant="light">
                  {values.type}
                </Badge>
              </Group>

              {values.variants.length > 0 && (
                <Group gap="xs" wrap="nowrap">
                  <Text c="dimmed" size="xs" style={{ flex: 1 }}>
                    Key
                  </Text>
                  <Text c="dimmed" size="xs" style={{ flex: 1 }}>
                    Value
                  </Text>
                  <div style={{ width: 28 }} />
                </Group>
              )}

              {values.variants.length === 0 && (
                <Text c="dimmed" size="sm">
                  No variants yet. Add one below.
                </Text>
              )}

              {values.variants.map((entry, index) => (
                <Group align="center" gap="xs" key={index} wrap="nowrap">
                  <TextInput
                    error={
                      form.errors[`variants.${index}.variantKey`] as
                        | string
                        | undefined
                    }
                    placeholder="variant-key"
                    style={{ flex: 1 }}
                    {...form.getInputProps(`variants.${index}.variantKey`)}
                  />
                  <div style={{ flex: 1 }}>{renderValueInput(index, entry)}</div>
                  <ActionIcon
                    color="red"
                    onClick={() => removeVariant(index)}
                    variant="subtle"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              ))}

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
        </Grid.Col>

        {/* RIGHT: Settings */}
        <Grid.Col span={{ base: 12, md: 5 }}>
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
        </Grid.Col>
      </Grid>
    </form>
  );
}
