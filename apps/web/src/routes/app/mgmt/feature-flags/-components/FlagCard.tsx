import classes from "./FlagCard.module.css";

import {
  ActionIcon,
  Badge,
  Card,
  Code,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";

import { ActionIconLink } from "@/components/RouterComponents";
import { type FeatureFlag } from "@/queries/getFeatureFlags";

const FLAG_TYPE_COLORS: Record<string, string> = {
  BOOLEAN: "teal",
  STRING: "blue",
  NUMBER: "orange",
};

interface FlagCardProps {
  flag: FeatureFlag;
  onDelete: () => void;
  isDeleting: boolean;
}

export function FlagCard({ flag, onDelete, isDeleting }: FlagCardProps) {
  return (
    <Card className={classes.card} padding="md" radius="md" withBorder>
      <Stack gap="sm" style={{ flex: 1 }}>
        {/* Header */}
        <Group justify="space-between" wrap="nowrap">
          <Text
            className={classes.key}
            ff="monospace"
            fw={700}
            size="sm"
            truncate="end"
          >
            {flag.key}
          </Text>
          <Group gap={6} wrap="nowrap">
            <Badge
              color={FLAG_TYPE_COLORS[flag.type] ?? "gray"}
              size="sm"
              variant="light"
            >
              {flag.type}
            </Badge>
            <Badge
              color={flag.enabled ? "green" : "red"}
              size="sm"
              variant="filled"
            >
              {flag.enabled ? "On" : "Off"}
            </Badge>
          </Group>
        </Group>

        {/* Description */}
        <Text c="dimmed" lineClamp={2} size="sm">
          {flag.description ?? <em>No description</em>}
        </Text>

        {/* Default variant */}
        <Group gap="xs" wrap="nowrap">
          <Text c="dimmed" size="xs" style={{ flexShrink: 0 }}>
            Default:
          </Text>
          <Code className={classes.variantKey}>{flag.defaultVariant}</Code>
          <Text c="dimmed" size="xs">
            →
          </Text>
          <Code className={classes.variantValue}>
            {JSON.stringify(flag.variants?.[flag.defaultVariant])}
          </Code>
        </Group>
      </Stack>

      <Card.Section inheritPadding mt="sm" py="xs" withBorder>
        <ActionIcon.Group className={classes.actions}>
          <ActionIconLink
            params={{ key: flag.key }}
            to="/app/mgmt/feature-flags/$key"
            variant="subtle"
          >
            <IconEdit size={14} />
          </ActionIconLink>
          <ActionIcon
            color="red"
            loading={isDeleting}
            onClick={onDelete}
            variant="subtle"
          >
            <IconTrash size={14} />
          </ActionIcon>
        </ActionIcon.Group>
      </Card.Section>
    </Card>
  );
}
