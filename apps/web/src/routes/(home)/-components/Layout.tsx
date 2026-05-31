import styles from "./Layout.module.css";

import React from "react";
import { Box } from "@mantine/core";

import { LanderFooter } from "./Footer";
import { LanderHeader } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function LanderLayout({ children }: LayoutProps) {
  return (
    <Box className={styles.layout}>
      <LanderHeader />
      <Box className={styles.mainContent} component="main">
        {children}
      </Box>
      <LanderFooter />
    </Box>
  );
}
