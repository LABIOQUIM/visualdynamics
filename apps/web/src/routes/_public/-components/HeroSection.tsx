import { Box } from "@mantine/core";
import { IconArrowRight, IconPlayerPlay } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { MoleculeField } from "./MoleculeField";
import styles from "./HeroSection.module.css";

export function LanderHeroSection() {
  return (
    <Box className={styles.hero}>
      <MoleculeField />

      <div className={styles.container}>
        <span className={styles.eyebrow}>Molecular dynamics for GROMACS</span>

        <h1 className={styles.title}>Visual Dynamics</h1>

        <p className={styles.subtitle}>
          Run GROMACS-powered simulations, analyze trajectories, and visualize
          molecular structures — all from a modern web interface. No terminal
          required.
        </p>

        <div className={styles.signalGrid}>
          <div className={styles.signalItem}>
            <span className={styles.signalLabel}>Simulation</span>
            <strong>Apoprotein and protein–ligand MD in GROMACS</strong>
          </div>
          <div className={styles.signalItem}>
            <span className={styles.signalLabel}>Analysis</span>
            <strong>RMSD, RMSF, radius of gyration, and more</strong>
          </div>
          <div className={styles.signalItem}>
            <span className={styles.signalLabel}>Reference</span>
            <strong>BMC Bioinformatics, DOI 10.1186/s12859-023-05234-y</strong>
          </div>
        </div>

        <div className={styles.buttonsGroup}>
          <Link className={styles.ctaPrimary} to="/login">
            <IconPlayerPlay size={20} />
            Launch App
          </Link>
          <a className={styles.ctaSecondary} href="#features">
            <IconPlayerPlay size={20} />
            What it does
          </a>
          <a className={styles.ctaTertiary} href="#publications">
            Explore the research
            <IconArrowRight size={20} />
          </a>
        </div>
      </div>
    </Box>
  );
}
