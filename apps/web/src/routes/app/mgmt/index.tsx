import classes from "./index.module.css";

import { Group, Text } from "@mantine/core";
import {
  IconArrowRight,
  IconAutomation,
  IconFlag,
  IconServerSpark,
  IconSettings,
  IconTools,
  IconUsers,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/app/mgmt/")({
  component: RouteComponent,
});

const sections = [
  {
    icon: IconUsers,
    label: "Users",
    description: "Review users and update account roles.",
    url: "/app/mgmt/users",
  },
  {
    icon: IconAutomation,
    label: "Simulations",
    description: "Inspect submitted simulation jobs and results.",
    url: "/app/mgmt/simulations",
  },
  {
    icon: IconServerSpark,
    label: "Server Statistics",
    description: "Monitor server metrics and queue diagnostics.",
    url: "/app/mgmt/server",
  },
  {
    icon: IconTools,
    label: "Tools",
    description: "Access management utilities.",
    url: "/app/mgmt/tools",
  },
  {
    icon: IconFlag,
    label: "Feature Flags",
    description: "Create and manage runtime feature flags.",
    url: "/app/mgmt/feature-flags",
  },
  {
    icon: IconSettings,
    label: "Settings",
    description: "Manage application settings.",
    url: "/app/mgmt/settings",
  },
];

function RouteComponent() {
  return (
    <PageLayout title="Management">
      <div className={classes.grid}>
        {sections.map(({ icon: Icon, label, description, url }) => (
          <Link className={classes.card} key={label} to={url}>
            <Group gap="sm" wrap="nowrap">
              <div className={classes.iconWrap}>
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <div className={classes.content}>
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600} size="sm">
                    {label}
                  </Text>
                  <IconArrowRight
                    color="var(--mantine-color-dimmed)"
                    size={14}
                    strokeWidth={1.5}
                  />
                </Group>
                <Text c="dimmed" size="xs">
                  {description}
                </Text>
              </div>
            </Group>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
