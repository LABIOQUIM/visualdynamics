import styles from "./Footer.module.css";

import { Box } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

export function LanderFooter() {
  return (
    <Box className={styles.footer} component="footer">
      <div className={styles.innerFooter}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Visual Dynamics — Fiocruz. All rights
          reserved.
        </p>
        <div className={styles.links}>
          <a
            className={styles.link}
            href="https://portal.fiocruz.br/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Fiocruz
          </a>
          <Link className={styles.link} to="/privacy">
            Privacy Policy
          </Link>
          <Link className={styles.link} to="/terms-of-service">
            Terms of Use
          </Link>
        </div>
        <a
          className={styles.socialIconLink}
          href="https://github.com/LABIOQUIM/visualdynamics"
          rel="noopener noreferrer"
          target="_blank"
        >
          <IconBrandGithub size={20} stroke={1.5} />
        </a>
      </div>
    </Box>
  );
}
