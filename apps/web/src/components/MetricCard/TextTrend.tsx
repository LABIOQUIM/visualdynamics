import { Text } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import {
  MetricCardTextMuted,
  type MetricCardTextMutedProps,
} from "./TextMuted";

import { match } from "@/utilities/match";
import { formatPercentage } from "@/utilities/number";

interface MetricCardTextTrendProps extends MetricCardTextMutedProps {
  value: number;
}

export function MetricCardTextTrend({
  value,
  children,
  ...props
}: MetricCardTextTrendProps) {
  const {
    sign,
    color,
    icon: Icon,
  } = match(
    [
      value > 0,
      { sign: "+", color: "var(--mantine-color-teal-6)", icon: IconTrendingUp },
    ],
    [
      value > 0,
      { sign: "", color: "var(--mantine-color-red-6)", icon: IconTrendingDown },
    ],
  );

  return (
    <MetricCardTextMuted
      style={{ textWrap: "nowrap", justifyContent: "center" }}
      {...props}
    >
      <Icon size="1rem" />
      <Text c={color} component="span" fz="inherit" mx="0.25rem">
        {formatPercentage(value, { prefix: sign })}
      </Text>
      {children}
    </MetricCardTextMuted>
  );
}
