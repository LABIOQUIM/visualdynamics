import React from "react";
import { Box } from "@mantine/core";
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import Link from "next/link";

import { RouteLinks } from "@/app/_constants/routes";

import styles from "./HeroSection.module.css";

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
          <Link href={RouteLinks.LOGIN} className={styles.ctaButtonPrimary}>
            <IconPlayerPlay size={22} />
            Launch App
          </Link>
          <Link href="#features" className={styles.ctaButtonSecondary}>
            Explore Features
            <IconArrowRight size={20} />
          </Link>
        </div>
      </div>
    </Box>
  );
}
