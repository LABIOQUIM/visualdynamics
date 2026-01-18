import styles from "./HeroSection.module.css";

import { Box } from "@mantine/core";
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export function LanderHeroSection() {
  return (
    <Box className={styles.hero}>
      <div className={styles.heroContainer}>
        {/* Replaces Mantine Container component's size prop */}
        <h1 className={styles.title}>Molecular Dynamics. Effortlessly.</h1>
        <p className={styles.subtitle}>
          Unlock complex insights from your simulations with Visual Dynamics. A
          powerful, web-based platform for trajectory analysis and stunning 3D
          visualization.
        </p>
        {/* Group for layout is fine */}
        <div className={styles.buttonsGroup}>
          <Link className={styles.ctaButtonPrimary} to="/auth/login">
            <IconPlayerPlay size={22} />
            Launch App
          </Link>
          <a className={styles.ctaButtonSecondary} href="#features">
            Explore Features
            <IconArrowRight size={20} />
          </a>
        </div>
      </div>
    </Box>
  );
}
