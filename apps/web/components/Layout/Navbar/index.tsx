"use client";
import { Box } from "@mantine/core";
import {
  IconCrown,
  IconHome,
  IconInfoCircle,
  IconListNumbers,
  IconPlus,
  IconReportAnalytics,
} from "@tabler/icons-react";
import { Session, User } from "lucia";

import { LoginButton } from "@/components/Auth/LoginButton";
import { RegisterButton } from "@/components/Auth/RegisterButton";
import { UserButton } from "@/components/Auth/UserButton";

import { Section } from "./Section";

import classes from "./Navbar.module.css";

const sections: NavSection[] = [
  {
    title: "System",
    links: [
      {
        icon: IconCrown,
        label: "Admin Dashboard",
        href: "/administration",
        role: "ADMINISTRATOR",
      },
      { icon: IconHome, label: "Home", href: "/" },
      { icon: IconInfoCircle, label: "About", href: "/" },
      { icon: IconReportAnalytics, label: "Statistics", href: "/" },
      { icon: IconListNumbers, label: "Tutorials", href: "/" },
    ],
  },
  {
    title: "Simulations",
    links: [
      { icon: IconInfoCircle, label: "My Simulations", href: "/simulations" },
      { icon: IconPlus, label: "New ACPYPE", href: "/simulations/acpype" },
      { icon: IconPlus, label: "New APO", href: "/simulations/apo" },
      {
        icon: IconPlus,
        label: "New PRODRG",
        href: "/simulations/prodrg",
        badge: { color: "red", message: "DEPRECATED" },
      },
    ],
  },
];

interface Props {
  session: Session | null;
  toggle(): void;
  user: User | null;
}

export function Navbar({ session, toggle, user }: Props) {
  const mainLinks = sections.map((section) => (
    <Section
      key={section.title}
      section={section}
      toggle={toggle}
      userRole={user?.role}
    />
  ));

  return (
    <Box className={classes.container}>
      <Box className={classes.section}>
        {session && user ? <UserButton user={user} /> : <LoginButton />}
      </Box>

      {session ? (
        <Box className={classes.section}>
          <Box className={classes.mainLinks}>{...mainLinks}</Box>
        </Box>
      ) : (
        <Box className={classes.section}>
          <RegisterButton />
        </Box>
      )}
    </Box>
  );
}
