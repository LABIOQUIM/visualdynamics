import React from "react";
import { Box } from "@mantine/core";
import { IconRocket } from "@tabler/icons-react";
import Link from "next/link";

import { RouteLinks } from "@/app/_constants/routes";

import styles from "./CallToActionSection.module.css";

export function LanderCallToActionSection() {
  return (
    <Box component="section" className={styles.ctaSection}>
      <div className={styles.ctaContainer}>
        <h2 className={styles.title}>Ready to Elevate Your Research?</h2>
        <p className={styles.description}>
          Join researchers worldwide who use Visual Dynamics to gain deeper
          insights from their molecular simulations. Launch the app and start
          exploring today!
        </p>
        <Link href={RouteLinks.LOGIN} className={styles.button}>
          <IconRocket size={22} />
          Get Started Now
        </Link>
      </div>
    </Box>
  );
}
