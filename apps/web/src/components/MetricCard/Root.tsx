import { Card, type CardProps, type ElementProps } from "@mantine/core";

type MetricCardRootProps = CardProps & ElementProps<"div", keyof CardProps>;

export function MetricCardRoot({ ...props }: MetricCardRootProps) {
  return <Card {...props} />;
}
