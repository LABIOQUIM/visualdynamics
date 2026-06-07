import styles from "./PapersSection.module.css";

import { Box, SimpleGrid } from "@mantine/core";
import { IconExternalLink, IconFileText } from "@tabler/icons-react";

const papers = [
  {
    title:
      "Visual dynamics: a WEB application for molecular dynamics simulation using GROMACS",
    venue: "BMC Bioinformatics",
    year: 2023,
    doi: "10.1186/s12859-023-05234-y",
    href: "https://doi.org/10.1186/s12859-023-05234-y",
    authors:
      "Vieira IHP, Botelho EB, de Souza Gomes TJ, Kist R, Caceres RA, Zanchi FB",
    metrics: "28k+ accesses · 130+ citations",
    excerpt:
      "VisualDynamics automates biological simulations in Gromacs through a graphical web interface, making molecular dynamics accessible to researchers without computational expertise. Supports apoprotein and protein–ligand simulations.",
  },
  {
    title: "New Features in Visual Dynamics 3.0",
    venue: "Journal of Visualized Experiments",
    year: 2024,
    doi: "10.3791/66964",
    href: "https://doi.org/10.3791/66964",
    authors: "Vieira IHP, Mendonça EAM, Guariero FL, Guimarães RMS, Zanchi FB",
    metrics: "Protocol article",
    excerpt:
      "A step-by-step protocol for protein–ligand complex simulation using ACPYPE-prepared ligands, demonstrating the platform's continuous evolution for validation, teaching, and demonstration purposes.",
  },
];

export function LanderPapersSection() {
  return (
    <Box className={styles.section} component="section" id="publications">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Research</span>
          <h2 className={styles.sectionTitle}>Our publications</h2>
          <p className={styles.sectionDescription}>
            Peer-reviewed articles we've published about the Visual Dynamics
            platform and its capabilities.
          </p>
        </div>

        <SimpleGrid
          cols={{ base: 1, lg: 2 }}
          spacing={{ base: "lg", sm: "xl" }}
        >
          {papers.map((p) => (
            <div className={styles.card} key={p.doi}>
              <div className={styles.cardIcon}>
                <IconFileText size={22} stroke={1.5} />
              </div>

              <div className={styles.cardMeta}>
                <span className={styles.venue}>
                  {p.venue} · {p.year}
                </span>
                <span className={styles.metrics}>{p.metrics}</span>
              </div>

              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.authors}>{p.authors}</p>
              <p className={styles.excerpt}>{p.excerpt}</p>

              <a
                className={styles.doiLink}
                href={p.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                DOI: {p.doi}
                <IconExternalLink size={12} />
              </a>
            </div>
          ))}
        </SimpleGrid>
      </div>
    </Box>
  );
}
