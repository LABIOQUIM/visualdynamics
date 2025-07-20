"use client";
import { Box } from "@mantine/core";
import {
  IconLayoutList,
  IconReportAnalytics,
  IconSettings2,
  IconUsers,
} from "@tabler/icons-react";

import { AdministrationNavSection } from "./NavSection";

import classes from "./Nav.module.css";

const nav: NavSection[] = [
  {
    title: "Visual Dynamics",
    links: [
      {
        href: "/dashboard/administration/users",
        icon: IconUsers,
        label: "Registered Users",
      },
      {
        href: "/dashboard/administration/visualdynamics/status",
        icon: IconReportAnalytics,
        label: "Server and Queue Status",
      },
      {
        href: "/dashboard/administration/visualdynamics/manage",
        icon: IconLayoutList,
        label: "Manage Simulations",
      },
      {
        href: "/dashboard/administration/visualdynamics/settings",
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
