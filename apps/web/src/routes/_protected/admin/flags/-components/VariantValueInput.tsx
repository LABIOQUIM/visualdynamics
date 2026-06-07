import { NumberInput, Switch, TextInput } from "@mantine/core";

import type { FlagFormValues, VariantEntry } from "./FlagForm";

interface VariantValueInputProps {
  type: FlagFormValues["type"];
  entry: VariantEntry;
  onChange: (value: string) => void;
}

export function VariantValueInput({
  type,
  entry,
  onChange,
}: VariantValueInputProps) {
  if (type === "BOOLEAN") {
    return (
      <Switch
        checked={entry.variantValue === "true"}
        label={entry.variantValue === "true" ? "true" : "false"}
        onChange={(e) => onChange(e.currentTarget.checked ? "true" : "false")}
      />
    );
  }

  if (type === "NUMBER") {
    const numVal = Number(entry.variantValue);
    return (
      <NumberInput
        onChange={(v) => onChange(String(v))}
        placeholder="0"
        value={Number.isNaN(numVal) ? "" : numVal}
      />
    );
  }

  return (
    <TextInput
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder="value"
      value={entry.variantValue}
    />
  );
}
