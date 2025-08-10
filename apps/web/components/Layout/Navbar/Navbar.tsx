"use client";
import { Box, Text } from "@mantine/core";
import {
  IconBrandGithub,
  IconCrown,
  IconExternalLink,
  IconHome,
  IconInfoCircle,
  IconListNumbers,
  IconMail,
  IconPlus,
  IconReportAnalytics,
  IconSpider,
} from "@tabler/icons-react";
import Link from "next/link";

import { RouteLinks } from "@/app/_constants/routes";
import { User } from "@/components/Auth/User/User";
import { useAuth } from "@/hooks/auth/useAuth";
import pkg from "@/package.json";

import { Section } from "./Section/Section";

import classes from "./Navbar.module.css";

const sections: NavSection[] = [
  {
    title: "General",
    links: [
      {
        icon: IconCrown,
        label: "Admin Dashboard",
        href: RouteLinks.ADMIN_DASHBOARD,
        role: "ADMINISTRATOR",
      },
      { icon: IconHome, label: "Home", href: RouteLinks.HOME },
      {
        icon: IconReportAnalytics,
        label: "Analytics",
        href: RouteLinks.ANALYTICS,
      },
      {
        icon: IconListNumbers,
        label: "Tutorials",
        href: RouteLinks.GUIDES,
      },
    ],
  },
  {
    title: "Simulations",
    links: [
      {
        icon: IconInfoCircle,
        label: "About",
        href: RouteLinks.SIMULATIONS_ABOUT,
      },
      {
        icon: IconInfoCircle,
        label: "My Submissions",
        href: RouteLinks.SIMULATIONS,
      },
    ],
  },
  {
    title: "New Simulation",
    links: [
      {
        icon: IconPlus,
        label: "New Free Protein (APO)",
        href: RouteLinks.SIMULATIONS_APO,
      },
      {
        icon: IconPlus,
        label: "New Protein + Ligand",
        href: RouteLinks.SIMULATIONS_ACPYPE,
      },
    ],
  },
  {
    title: "More LABIOQUIM Tools",
    links: [
      {
        icon: IconExternalLink,
        label: "PlasmoQSAR",
        href: RouteLinks.PLASMO_QSAR,
        external: true,
      },
      {
        icon: IconExternalLink,
        label: "PlasmoIA",
        href: RouteLinks.PLASMO_IA,
        external: true,
      },
    ],
  },
];

interface Props {
  toggle(): void;
}

export function Navbar({ toggle }: Props) {
  const { data } = useAuth();

  const mainLinks = sections.map((section) => (
    <Section
      key={section.title}
      section={section}
      toggle={toggle}
      userRole={data?.user?.role}
    />
  ));

  return (
    <Box className={classes.container}>
      <Box className={classes.section} display="flex">
        <Box className={classes.topLinks}>
          <Box className={classes.topLinksIcons}>
            <Link
              className={classes.topLinksIcon}
              title="Visual Dynamics on GitHub"
              target="_blank"
              href="https://github.com/labioquim/visualdynamics"
            >
              <IconBrandGithub />
            </Link>
            <Link
              className={classes.topLinksIcon}
              title="Report a Bug"
              target="_blank"
              href="https://github.com/LABIOQUIM/visualdynamics/issues/new?template=bug_report.md"
            >
              <IconSpider />
            </Link>
            <Link
              className={classes.topLinksIcon}
              title="LABIOQUIM Support Email"
              target="_blank"
              href="mailto:visualdynamics@fiocruz.br"
            >
              <IconMail />
            </Link>
          </Box>
          <Text className={classes.versionText}>v{pkg.version}</Text>
        </Box>
      </Box>

      <Box className={classes.section}>
        <User />
      </Box>
      <Box className={classes.section}>
        <Box className={classes.mainLinks}>{...mainLinks}</Box>
      </Box>
    </Box>
  );
}
