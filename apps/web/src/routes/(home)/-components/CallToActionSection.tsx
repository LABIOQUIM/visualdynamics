import styles from "./CallToActionSection.module.css";

import { Box } from "@mantine/core";
import { IconRocket } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export function LanderCallToActionSection() {
  return (
    <Box className={styles.ctaSection} component="section">
      <div className={styles.ctaContainer}>
        <h2 className={styles.title}>Ready to Elevate Your Research?</h2>
        <p className={styles.description}>
          Join researchers worldwide who use Visual Dynamics to gain deeper
          insights from their molecular simulations. Launch the app and start
          exploring today!
        </p>
        <Link className={styles.button} to="/auth/login">
          <IconRocket size={22} />
          Get Started Now
        </Link>
      </div>
    </Box>
  );
}
