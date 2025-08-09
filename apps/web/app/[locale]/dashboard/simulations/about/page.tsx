import { Box, List, ListItem, Text, Title } from "@mantine/core";
import Link from "next/link";

import { PageLayout } from "@/components/Layout/PageLayout/PageLayout";

import { AboutSummary } from "./Summary";

import classes from "./page.module.css";

export const metadata = {
  title: "About",
};

export default function SimulationsAboutPage() {
  return (
    <PageLayout>
      <Title>About Visual Dynamics</Title>

      <Box className={classes.container}>
        <AboutSummary />

        <Box className={classes.containerText}>
          <Text>
            Visual Dynamics is a web-based tool designed to democratize
            molecular dynamics (MD) simulations. By leveraging the power of
            GROMACS within an intuitive graphical interface, it eliminates the
            complexities of command-line usage and local software installations.
            This makes MD simulations accessible to a broader audience,
            including researchers, educators, and students, regardless of their
            computational expertise or access to high-performance computing
            resources.
          </Text>
          <Text>
            With a focus on protein-ligand interactions, a crucial aspect of
            drug discovery and biological research, Visual Dynamics simplifies
            the setup, execution, and analysis of these simulations. Key
            features include a user-friendly interface, browser-based
            accessibility, and a focus on educational applications. Being open
            source, it encourages community contributions and fosters a
            collaborative environment for advancing MD research and education.
          </Text>
          <Title order={2}>Papers</Title>
          <List type="ordered">
            <ListItem>
              <Text className={classes.listItem}>
                Vieira, I.H.P., Botelho, E.B., de Souza Gomes, T.J. et al.
                Visual dynamics: a WEB application for molecular dynamics
                simulation using GROMACS. BMC Bioinformatics 24, 107 (2023).{" "}
                <Link
                  href="https://doi.org/10.1186/s12859-023-05234-y"
                  target="_blank"
                >
                  https://doi.org/10.1186/s12859-023-05234-y
                </Link>
              </Text>
            </ListItem>
            <ListItem>
              <Text className={classes.listItem}>
                Henrique Provensi Vieira, I., Mendonça, E. A. M., Guariero, F.
                L., Guimarães, R. M. d. S., Zanchi, F. B. New Features in Visual
                Dynamics 3.0. J. Vis. Exp. (210), e66964, doi:{" "}
                <Link href="https://doi.org/10.3791/66964" target="_blank">
                  10.3791/66964
                </Link>{" "}
                (2024).
              </Text>
            </ListItem>
          </List>
        </Box>
      </Box>
    </PageLayout>
  );
}
