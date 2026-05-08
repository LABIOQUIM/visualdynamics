import styles from "./Header.module.css";

import { Box, Group } from "@mantine/core"; // Group for layout, Box for semantic header
import { IconPlayerPlay } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import VISUAL_DYNAMICS_LOGO from "@/assets/visualdynamics.svg";

export function LanderHeader() {
  return (
    <Box className={styles.header} component="header">
      <div className={styles.innerHeader}>
        <Link to="/">
          <img
            alt="Visual Dynamics Logo"
            className={styles.logoImage}
            src={VISUAL_DYNAMICS_LOGO}
          />
        </Link>
        <Group>
          {/* Mantine Group for spacing items is fine */}
          <nav className={styles.navLinks}>
            <Link className={styles.navLink} to="/">
              About
            </Link>
            <Link className={styles.navLink} to="/guides">
              Guides
            </Link>
          </nav>
          <Link className={styles.launchButton} to="/auth/login">
            <IconPlayerPlay size={22} />
            Launch App
          </Link>
        </Group>
      </div>
    </Box>
  );
}
