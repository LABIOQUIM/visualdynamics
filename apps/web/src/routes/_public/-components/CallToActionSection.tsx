import styles from "./CallToActionSection.module.css";

import { Box } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export function LanderCallToActionSection() {
  return (
    <Box className={styles.ctaSection} component="section">
      <div className={styles.ctaContainer}>
        <span className={styles.eyebrow}>Get started</span>
        <h2 className={styles.title}>Start simulating today</h2>
        <p className={styles.description}>
          No terminal. No setup. Upload your structures and run molecular
          dynamics simulations directly in your browser.
        </p>
        <div className={styles.actions}>
          <Link className={styles.button} to="/login">
            <IconPlayerPlay size={20} />
            Launch Visual Dynamics
          </Link>
        </div>
      </div>
    </Box>
  );
}
