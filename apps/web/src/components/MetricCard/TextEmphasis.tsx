import { type ElementProps, Text, type TextProps } from "@mantine/core";

type MetricCardTextEmphasis = Omit<TextProps, "fz" | "fw"> &
  ElementProps<"p", keyof TextProps>;

export function MetricCardTextEmphasis(props: MetricCardTextEmphasis) {
  return <Text fw="bold" fz="h4" {...props} />;
}
