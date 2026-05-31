import classes from "./index.module.css";

import { ActionIcon, Box, Text } from "@mantine/core";
import {
  IconAutomation,
  IconBrandGithub,
  IconExternalLink,
  IconFlag,
  IconInfoCircle,
  IconListNumbers,
  IconMail,
  IconMailForward,
  IconPlus,
  IconReportAnalytics,
  IconServerSpark,
  IconSettings,
  IconSpider,
  IconTableImport,
  IconTools,
  IconUsers,
} from "@tabler/icons-react";
import { useMemo } from "react";

import { Section } from "./Section";
import { User } from "./User";

import { authClient } from "@/lib/auth-client";

const sections: NavSection[] = [
  {
    title: "Simulations",
    links: [
      {
        icon: IconAutomation,
        label: "My Simulations",
        href: "/app",
      },
      {
        icon: IconPlus,
        label: "New Simulation",
        href: "/app/submit",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      { icon: IconInfoCircle, label: "About", href: "/" },
      {
        icon: IconListNumbers,
        label: "Tutorials",
        href: "/guides",
      },
      {
        icon: IconReportAnalytics,
        label: "Analytics",
        href: "/analytics",
      },
      {
        icon: IconExternalLink,
        label: "RondonQSAR",
        href: "https://rondonqsar.fiocruz.br/",
        external: true,
      },
    ],
  },
];

const adminSections: NavSection[] = [
  {
    title: "Admin",
    links: [
      {
        href: "/app/mgmt",
        icon: IconServerSpark,
        label: "Operations",
        children: [
          {
            label: "Users",
            icon: IconUsers,
            href: "/app/mgmt/users",
          },
          {
            label: "Simulations",
            icon: IconAutomation,
            href: "/app/mgmt/simulations",
          },
          {
            label: "Server Statistics",
            icon: IconServerSpark,
            href: "/app/mgmt/server",
          },
        ],
      },
      {
        href: "/app/mgmt",
        icon: IconSettings,
        label: "Configuration",
        children: [
          {
            label: "Feature Flags",
            icon: IconFlag,
            href: "/app/mgmt/feature-flags",
          },
          {
            label: "Settings",
            icon: IconSettings,
            href: "/app/mgmt/settings",
          },
        ],
      },
      {
        label: "Tools",
        icon: IconTools,
        href: "/app/mgmt/tools",
        children: [
          {
            label: "All Tools",
            icon: IconTools,
            href: "/app/mgmt/tools",
          },
          {
            label: "Simulation Importer",
            icon: IconTableImport,
            href: "/app/mgmt/tools/simulation-importer",
          },
          {
            label: "User Importer",
            icon: IconTableImport,
            href: "/app/mgmt/tools/user-importer",
          },
          {
            label: "Batch Email",
            icon: IconMailForward,
            href: "/app/mgmt/tools/batch-email",
          },
        ],
      },
    ],
  },
];

const simulationSections = sections.slice(0, 1);
const resourceSections = sections.slice(1);

function getFinalSections(isAdmin: boolean) {
  if (isAdmin) {
    return [...simulationSections, ...adminSections, ...resourceSections];
  }

  return sections;
}

interface Props {
  toggle(): void;
}

export function Navbar({ toggle }: Props) {
  const { data } = authClient.useSession();

  const finalSections = useMemo(() => getFinalSections(data?.user?.role === "admin"), [data]);

  const mainLinks = finalSections.map((section) => (
    <Section key={section.title} section={section} toggle={toggle} />
  ));

  return (
    <Box className={classes.container}>
      <Box className={classes.section} display="flex">
        <Box className={classes.topLinks}>
          <Box className={classes.topLinksIcons}>
            <ActionIcon
              component="a"
              href="https://github.com/labioquim/visualdynamics"
              rel="noreferrer"
              target="_blank"
              title="Visual Dynamics on GitHub"
              variant="light"
            >
              <IconBrandGithub />
            </ActionIcon>
            <ActionIcon
              component="a"
              href="https://github.com/LABIOQUIM/visualdynamics/issues/new?template=bug_report.md"
              rel="noreferrer"
              target="_blank"
              title="Report a Bug"
              variant="light"
            >
              <IconSpider />
            </ActionIcon>
            <ActionIcon
              component="a"
              href="mailto:visualdynamics@fiocruz.br"
              rel="noreferrer"
              target="_blank"
              title="LABIOQUIM Support Email"
              variant="light"
            >
              <IconMail />
            </ActionIcon>
          </Box>
          <Text className={classes.versionText}>v{__VERSION__}</Text>
        </Box>
      </Box>

      <Box className={classes.section}>
        <User />
      </Box>
      <Box className={classes.section}>
        <Box className={classes.mainLinks}>{mainLinks}</Box>
      </Box>
    </Box>
  );
}
