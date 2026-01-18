import React from "react";
import { Badge } from "@mantine/core";

import styles from "./FeatureCard.module.css";

interface FeatureCardProps {
  icon: React.ReactNode; // Expect a Tabler Icon component
  title: string;
  description: string;
  soon?: boolean;
}

export function FeatureCard({
  icon,
  title,
  description,
  soon,
}: FeatureCardProps) {
  return (
    // Using Paper as a semantic container, styling via CSS Module
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        {/* Icon is passed as a child, already sized */}
        {icon}
      </div>
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>{title}</h3>
        {soon && <Badge size="xs">soon</Badge>}
      </div>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
