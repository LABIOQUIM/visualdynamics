import classes from "./Navbar.module.css";

import { Box, Text } from "@mantine/core";
import {
  IconAutomation,
  IconBrandGithub,
  IconCrown,
  IconExternalLink,
  IconInfoCircle,
  IconListNumbers,
  IconMail,
  IconPlus,
  IconReportAnalytics,
  IconSpider,
} from "@tabler/icons-react";

import { Section } from "./Section";
import { User } from "./User";

const sections: NavSection[] = [
  {
    title: "General",
    links: [
      {
        icon: IconCrown,
        label: "Admin Dashboard",
        href: "/",
        role: "ADMINISTRATOR",
      },
      { icon: IconInfoCircle, label: "About", href: "/" },
      {
        icon: IconReportAnalytics,
        label: "Analytics",
        href: "/analytics",
      },
      {
        icon: IconListNumbers,
        label: "Tutorials",
        href: "/guides",
      },
    ],
  },
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
    title: "More LABIOQUIM Tools",
    links: [
      {
        icon: IconExternalLink,
        label: "PlasmoQSAR",
        href: "https://www.qsar.labioquim.fiocruz.br/",
        external: true,
      },
      {
        icon: IconExternalLink,
        label: "PlasmoIA",
        href: "https://www.plasmoia.labioquim.fiocruz.br/",
        external: true,
      },
    ],
  },
];

interface Props {
  toggle(): void;
}

export function Navbar({ toggle }: Props) {
  const mainLinks = sections.map((section) => (
    <Section
      key={section.title}
      section={section}
      toggle={toggle}
      // userRole={data?.user?.role}
    />
  ));

  return (
    <Box className={classes.container}>
      <Box className={classes.section} display="flex">
        <Box className={classes.topLinks}>
          <Box className={classes.topLinksIcons}>
            <a
              className={classes.topLinksIcon}
              href="https://github.com/labioquim/visualdynamics"
              rel="noreferrer"
              target="_blank"
              title="Visual Dynamics on GitHub"
            >
              <IconBrandGithub />
            </a>
            <a
              className={classes.topLinksIcon}
              href="https://github.com/LABIOQUIM/visualdynamics/issues/new?template=bug_report.md"
              rel="noreferrer"
              target="_blank"
              title="Report a Bug"
            >
              <IconSpider />
            </a>
            <a
              className={classes.topLinksIcon}
              href="mailto:visualdynamics@fiocruz.br"
              rel="noreferrer"
              target="_blank"
              title="LABIOQUIM Support Email"
            >
              <IconMail />
            </a>
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
