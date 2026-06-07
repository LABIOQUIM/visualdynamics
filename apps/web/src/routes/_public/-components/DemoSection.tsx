import styles from "./DemoSection.module.css";

import { Box } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";

export function LanderDemoSection() {
  return (
    <Box className={styles.demoSection} component="section" id="demo">
      <div className={styles.demoContainer}>
        <h2 className={styles.sectionTitle}>See It In Action</h2>
        <p className={styles.description}>
          Watch a quick demonstration of Visual Dynamics transforming raw
          simulation data into meaningful visualizations and analyses.
        </p>
        {/* AspectRatio for maintaining video dimensions is a structural prop */}
        <div className={styles.videoPlaceholder}>
          <IconPlayerPlay className={styles.playIcon} size={80} stroke={1.5} />
        </div>
      </div>
    </Box>
  );
}
