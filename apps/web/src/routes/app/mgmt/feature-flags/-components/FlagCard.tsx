import classes from "./FlagCard.module.css";

import { ActionIcon, Badge, Card, Group, Stack, Text } from "@mantine/core";
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
    <Card padding="md" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text
            className={classes.key}
            ff="monospace"
            fw={600}
            size="sm"
            truncate="end"
          >
            {flag.key}
          </Text>
          <Group gap={6} wrap="nowrap">
            <Badge
              className={classes.badge}
              color={FLAG_TYPE_COLORS[flag.type] ?? "gray"}
              variant="light"
            >
              {flag.type}
            </Badge>
            <Badge
              className={classes.badge}
              color={flag.enabled ? "green" : "red"}
              variant="light"
            >
              {flag.enabled ? "On" : "Off"}
            </Badge>
          </Group>
        </Group>

        <Text c="dimmed" lineClamp={2} size="sm">
          {flag.description ?? <em>No description</em>}
        </Text>

        <Group gap={4}>
          <Text c="dimmed" size="xs">
            Default:
          </Text>
          <Text ff="monospace" size="xs">
            {flag.defaultVariant}
          </Text>
          <Text c="dimmed" size="xs">
            →
          </Text>
          <Text ff="monospace" size="xs">
            {JSON.stringify(flag.variants?.[flag.defaultVariant])}
          </Text>
        </Group>
      </Stack>

      <Card.Section inheritPadding mt="sm" py="sm" withBorder>
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
