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
        href: "/dashboard/administration",
        role: "ADMINISTRATOR",
      },
      { icon: IconHome, label: "Home", href: "/" },
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
        icon: IconInfoCircle,
        label: "About",
        href: "/dashboard/simulations/about",
      },
      {
        icon: IconInfoCircle,
        label: "My Submissions",
        href: "/dashboard/simulations",
      },
    ],
  },
  {
    title: "New Simulation",
    links: [
      {
        icon: IconPlus,
        label: "New Free Protein (APO)",
        href: "/dashboard/simulations/apo",
      },
      {
        icon: IconPlus,
        label: "New Protein + Ligand",
        href: "/dashboard/simulations/acpype",
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
