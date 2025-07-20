import React from "react";
import { Box, Group } from "@mantine/core"; // Group for layout, Box for semantic header
import { IconPlayerPlay } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link"; // Next.js Link

import VISUAL_DYNAMICS_LOGO from "@/assets/visualdynamics.svg";

import styles from "./Header.module.css";

export function LanderHeader() {
  return (
    <Box component="header" className={styles.header}>
      <div className={styles.innerHeader}>
        <Link href="/">
          <Image
            className={styles.logoImage}
            src={VISUAL_DYNAMICS_LOGO}
            alt="Visual Dynamics Logo"
          />
        </Link>
        <Group>
          {/* Mantine Group for spacing items is fine */}
          <nav className={styles.navLinks}>
            <Link href="/" passHref legacyBehavior>
              <a className={styles.navLink}>Home</a>
            </Link>
            <Link href="/guides" passHref legacyBehavior>
              <a className={styles.navLink}>Guides</a>
            </Link>
          </nav>
          <Link href="/auth/login" className={styles.launchButton}>
            <IconPlayerPlay size={22} />
            Launch App
          </Link>
        </Group>
      </div>
    </Box>
  );
}
