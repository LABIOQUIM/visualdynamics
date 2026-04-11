import classes from "./index.module.css";

import { Group, Text } from "@mantine/core";
import {
  IconArrowRight,
  IconMailForward,
  IconTableImport,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Heading } from "@/components/Heading";
import { PageLayout } from "@/components/PageLayout";

export const Route = createFileRoute("/app/mgmt/tools/")({
  component: RouteComponent,
});

const tools = [
  {
    icon: IconTableImport,
    label: "User Importer",
    description: "Bulk-import users from a CSV file.",
    url: "/app/mgmt/tools/user-importer",
  },
  {
    icon: IconTableImport,
    label: "Simulation Importer",
    description: "Bulk-import simulations from a CSV file.",
    url: "/app/mgmt/tools/simulation-importer",
  },
  {
    icon: IconMailForward,
    label: "Batch Email",
    description: "Send a single email to multiple users at once.",
    url: "/app/mgmt/tools/batch-email",
  },
];

function RouteComponent() {
  return (
    <PageLayout>
      <Heading title="Management Tools" />
      <div className={classes.grid}>
        {tools.map(({ icon: Icon, label, description, url }) => (
          <Link className={classes.card} key={label} to={url}>
            <Group gap="sm" wrap="nowrap">
              <div className={classes.iconWrap}>
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
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
