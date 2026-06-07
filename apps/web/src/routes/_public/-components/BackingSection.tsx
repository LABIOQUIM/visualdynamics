import styles from "./BackingSection.module.css";

import { Box, SimpleGrid } from "@mantine/core";

import FIOCRUZ from "@/assets/fiocruz.jpg";
import FIOCRUZRO from "@/assets/fiocruz-ro.png";
import LABIOQUIM from "@/assets/labioquim.png";
import UFCSPA from "@/assets/ufcspa.png";

const backers = [
  { name: "LABIOQUIM", image: LABIOQUIM },
  { name: "FIOCRUZ", image: FIOCRUZ },
  { name: "FIOCRUZ/RO", image: FIOCRUZRO },
  { name: "UFCSPA", image: UFCSPA },
];

export function LanderBackingSection() {
  return (
    <Box className={styles.section} component="section">
      <div className={styles.container}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>Backed by</span>
          <h2>Trusted by leading institutions</h2>
          <p>
            Developed and supported by research institutions committed to
            advancing open science in Brazil.
          </p>
        </div>

        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 4 }}
          spacing={{ base: "lg", sm: "xl" }}
        >
          {backers.map((backer) => (
            <div className={styles.backerCard} key={backer.name}>
              <img
                alt={backer.name}
                className={styles.backerImage}
                src={backer.image}
              />
              <span className={styles.backerName}>{backer.name}</span>
            </div>
          ))}
        </SimpleGrid>
      </div>
    </Box>
  );
}
