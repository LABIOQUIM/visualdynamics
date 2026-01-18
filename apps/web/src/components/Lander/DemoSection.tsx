import { Box } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";

import styles from "./DemoSection.module.css";

export function LanderDemoSection() {
  return (
    <Box component="section" className={styles.demoSection} id="demo">
      <div className={styles.demoContainer}>
        <h2 className={styles.sectionTitle}>See It In Action</h2>
        <p className={styles.description}>
          Watch a quick demonstration of Visual Dynamics transforming raw
          simulation data into meaningful visualizations and analyses.
        </p>
        {/* AspectRatio for maintaining video dimensions is a structural prop */}
        <div className={styles.videoPlaceholder}>
          <IconPlayerPlay size={80} className={styles.playIcon} stroke={1.5} />
        </div>
      </div>
    </Box>
  );
}
