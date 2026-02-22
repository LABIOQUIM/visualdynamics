import classes from "./index.module.css";

import { Button, SimpleGrid } from "@mantine/core";
import { IconArrowRight, IconTableImport } from "@tabler/icons-react";
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
    url: "/app/mgmt/tools/user-importer",
  },
];

function RouteComponent() {
  return (
    <PageLayout>
      <Heading title="Management Tools" />
      <SimpleGrid cols={{ sm: 1, md: 2, lg: 3, xl: 4, "2xl": 5 }}>
        {tools.map(({ icon: Icon, label, url }) => (
          <Link key={label} to={url}>
            <Button
              classNames={{
                label: classes.toolLabel,
              }}
              leftSection={<Icon strokeWidth={1.5} />}
              rightSection={<IconArrowRight strokeWidth={1.5} />}
            >
              {label}
            </Button>
          </Link>
        ))}
      </SimpleGrid>
    </PageLayout>
  );
}
