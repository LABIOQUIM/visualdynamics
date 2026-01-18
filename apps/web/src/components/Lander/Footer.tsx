import { Box } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

import styles from "./Footer.module.css";
import { Link } from "@tanstack/react-router";

export function LanderFooter() {
  return (
    <Box component="footer" className={styles.footer}>
      <div className={styles.innerFooter}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Visual Dynamics - Fiocruz. All rights
          reserved.
        </p>
        <div className={styles.links}>
          <a
            href="https://portal.fiocruz.br/"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Fiocruz
          </a>
          <Link
            to="/privacy"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Use
          </Link>
        </div>
        <div className={styles.socialIcons}>
          <a
            href="https://github.com/LABIOQUIM/visualdynamics"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIconLink}
          >
            <IconBrandGithub size={22} stroke={1.5} />
          </a>
          {/* Add other social links if available */}
          {/* <a href="https://twitter.com/fiocruz" target="_blank" rel="noopener noreferrer" className={styles.socialIconLink}>
            <IconBrandTwitter size={22} stroke={1.5} />
          </a> */}
        </div>
      </div>
    </Box>
  );
}
