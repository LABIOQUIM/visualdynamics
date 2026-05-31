import styles from "./FeatureCard.module.css";

import React from "react";
import { Badge } from "@mantine/core";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  soon?: boolean | undefined;
}

export function FeatureCard({
  icon,
  title,
  description,
  soon,
}: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>{icon}</div>
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>{title}</h3>
        {soon && <Badge size="xs">soon</Badge>}
      </div>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
