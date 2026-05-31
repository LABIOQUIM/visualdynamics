import styles from "./FeaturesSection.module.css";

import { Box, SimpleGrid } from "@mantine/core";
import {
  IconChartArrowsVertical,
  IconCloudComputing,
  IconCode,
  IconEye,
  IconShare3,
  IconUsers,
} from "@tabler/icons-react";

import { FeatureCard } from "./FeatureCard";

const featuresData = [
  {
    icon: <IconEye size={30} />,
    title: "3D Visualization",
    soon: true,
    description:
      "Explore molecular structures and trajectories in 3D via NGL Viewer.",
  },
  {
    icon: <IconChartArrowsVertical size={30} />,
    title: "Analysis Tools",
    description:
      "Perform RMSD, RMSF, radius of gyration and more directly in your browser.",
  },
  {
    icon: <IconShare3 size={30} />,
    title: "Collaboration",
    soon: true,
    description: "Share sessions and analysis results with your research team.",
  },
  {
    icon: <IconCloudComputing size={30} />,
    title: "Web-Based",
    description:
      "No installation. Access Visual Dynamics from any modern browser.",
  },
  {
    icon: <IconCode size={30} />,
    title: "Open Source",
    description: "Built on open standards. Hosted and maintained by Fiocruz.",
  },
  {
    icon: <IconUsers size={30} />,
    title: "For Everyone",
    description:
      "Designed for seasoned researchers and students learning MD alike.",
  },
];

export function LanderFeaturesSection() {
  return (
    <Box className={styles.featuresSection} component="section" id="features">
      <div className={styles.featuresContainer}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Capabilities</span>
          <h2 className={styles.sectionTitle}>Everything you need</h2>
          <p className={styles.sectionDescription}>
            From structure upload to publication-ready analysis, all in one
            platform.
          </p>
        </div>

        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: "lg", sm: "xl" }}
        >
          {featuresData.map((feature) => (
            <FeatureCard
              description={feature.description}
              icon={feature.icon}
              key={feature.title}
              {...(feature.soon ? { soon: true } : {})}
              title={feature.title}
            />
          ))}
        </SimpleGrid>
      </div>
    </Box>
  );
}
