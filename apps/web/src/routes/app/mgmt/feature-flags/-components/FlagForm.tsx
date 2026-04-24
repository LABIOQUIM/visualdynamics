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
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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

const variantSchema = z.object({
  variantKey: z.string(),
  variantValue: z.string(),
});

const schema = z
  .object({
    key: z.string().min(1, "Key is required"),
    type: z.enum(["BOOLEAN", "STRING", "NUMBER"] as const),
    enabled: z.boolean(),
    defaultVariant: z.string(),
    variants: z.array(variantSchema),
    description: z.string(),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.variants.forEach((v, i) => {
      if (!v.variantKey.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Key is required",
          path: ["variants", i, "variantKey"],
        });
      } else if (seen.has(v.variantKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Variant keys must be unique",
          path: ["variants", i, "variantKey"],
        });
      } else {
        seen.add(v.variantKey);
      }
    });
  });

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
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FlagFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...DEFAULT_VALUES, ...initialValues },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const currentType = useWatch({ control, name: "type" });
  const currentVariants = useWatch({ control, name: "variants" });

  const variantKeyOptions = Array.from(
    new Map(
      (currentVariants ?? [])
        .filter((e) => e.variantKey.trim())
        .map((e) => [
          e.variantKey,
          { value: e.variantKey, label: e.variantKey },
        ]),
    ).values(),
  );

  function addVariant() {
    append({
      variantKey: "",
      variantValue: currentType === "BOOLEAN" ? "true" : "",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={classes.grid}>
        <Paper p="md" withBorder>
          <Stack>
            <Group justify="space-between">
              <Title order={5}>Variants</Title>
              <Badge
                color={FLAG_TYPE_COLORS[currentType] ?? "gray"}
                variant="light"
              >
                {currentType}
              </Badge>
            </Group>

            {fields.length === 0 ? (
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

                {fields.map((field, index) => (
                  <div className={classes.variantRow} key={field.id}>
                    <TextInput
                      error={errors.variants?.[index]?.variantKey?.message}
                      placeholder="variant-key"
                      {...register(`variants.${index}.variantKey`)}
                    />
                    <Controller
                      control={control}
                      name={`variants.${index}.variantValue`}
                      render={({ field: { value, onChange } }) => (
                        <VariantValueInput
                          entry={{ ...field, variantValue: value }}
                          onChange={onChange}
                          type={currentType}
                        />
                      )}
                    />
                    <ActionIcon
                      color="red"
                      onClick={() => remove(index)}
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
            error={errors.key?.message}
            label="Key"
            placeholder="my-feature-flag"
            {...register("key")}
          />
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <Select
                data={FLAG_TYPE_OPTIONS}
                disabled={disabledFields.includes("type")}
                label="Type"
                onChange={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="defaultVariant"
            render={({ field: { value, onChange } }) => (
              <Select
                data={variantKeyOptions}
                label="Default Variant"
                onChange={onChange}
                placeholder="Select a variant"
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="enabled"
            render={({ field: { value, onChange } }) => (
              <Switch
                checked={value}
                label="Enabled"
                onChange={(e) => onChange(e.currentTarget.checked)}
              />
            )}
          />
          <TextInput
            label="Description"
            placeholder="Optional description"
            {...register("description")}
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
