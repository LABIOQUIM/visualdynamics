"use client";
import { Box } from "@mantine/core";
import {
  IconLayoutList,
  IconReportAnalytics,
  IconSettings2,
  IconUsers,
} from "@tabler/icons-react";

import { RouteLinks } from "@/app/_constants/routes";

import { AdministrationNavSection } from "./NavSection";

import classes from "./Nav.module.css";

const nav: NavSection[] = [
  {
    title: "Visual Dynamics",
    links: [
      {
        href: RouteLinks.ADMIN_USERS,
        icon: IconUsers,
        label: "Registered Users",
      },
      {
        href: RouteLinks.ADMIN_STATUS,
        icon: IconReportAnalytics,
        label: "Server and Queue Status",
      },
      {
        href: RouteLinks.ADMIN_SIMULATIONS,
        icon: IconLayoutList,
        label: "Manage Simulations",
      },
      {
        href: RouteLinks.ADMIN_SETTINGS,
        icon: IconSettings2,
        label: "Settings",
      },
    ],
  },
];

export function AdministrationNav() {
  return (
    <Box className={classes.container}>
      {nav.map((section) => (
        <AdministrationNavSection
          key={JSON.stringify(section)}
          section={section}
        />
      ))}
    </Box>
  );
}
