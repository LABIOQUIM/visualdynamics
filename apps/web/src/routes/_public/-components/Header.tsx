import styles from "./Header.module.css";

import { Box, Group } from "@mantine/core";
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
          <nav className={styles.navLinks}>
            <Link className={styles.navLink} to="/guides">
              Guides
            </Link>
          </nav>
          <Link className={styles.launchButton} to="/login">
            <IconPlayerPlay size={18} />
            <span className={styles.launchLabel}>Launch App</span>
          </Link>
        </Group>
      </div>
    </Box>
  );
}
