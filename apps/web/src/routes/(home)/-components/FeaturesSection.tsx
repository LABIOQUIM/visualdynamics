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
    icon: <IconEye size={32} />,
    title: "Interactive 3D Visualization",
    soon: true,
    description:
      "Explore molecular structures and trajectories in stunning 3D, powered by NGL Viewer.",
  },
  {
    icon: <IconChartArrowsVertical size={32} />,
    title: "Powerful Analysis Tools",
    description: "Perform RMSD, RMSF and more, directly in your browser.",
  },
  {
    icon: <IconShare3 size={32} />,
    title: "Seamless Collaboration",
    soon: true,
    description:
      "Easily share your sessions, visualizations, and analysis results with colleagues.",
  },
  {
    icon: <IconCloudComputing size={32} />,
    title: "Web-Based & Accessible",
    description:
      "No installation needed. Access Visual Dynamics from any modern web browser.",
  },
  {
    icon: <IconCode size={32} />,
    title: "Open Source Platform",
    description:
      "Built on open standards and contributed by the scientific community. Hosted by Fiocruz.",
  },
  {
    icon: <IconUsers size={32} />,
    title: "For Researchers & Students",
    description:
      "An intuitive tool designed for both seasoned researchers and students learning MD.",
  },
];

export function LanderFeaturesSection() {
  return (
    <Box className={styles.featuresSection} component="section" id="features">
      <div className={styles.featuresContainer}>
        <h2 className={styles.sectionTitle}>Core Capabilities</h2>
        {/* Using SimpleGrid for layout. Its cols and spacing props are fine. */}
        <SimpleGrid
          className={styles.grid}
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: "lg", sm: "xl" }} // Mantine spacing tokens
        >
          {featuresData.map((feature) => (
            <FeatureCard
              description={feature.description}
              icon={feature.icon}
              key={feature.title}
              soon={feature.soon}
              title={feature.title}
            />
          ))}
        </SimpleGrid>
      </div>
    </Box>
  );
}
