import React from "react";
import { Box } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";

import styles from "./Footer.module.css";

export function LanderFooter() {
  return (
    <Box component="footer" className={styles.footer}>
      <div className={styles.innerFooter}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Visual Dynamics - Fiocruz. All rights
          reserved.
        </p>
        <div className={styles.links}>
          <Link
            href="https://portal.fiocruz.br/"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Fiocruz
          </Link>
          <Link
            href="/privacy"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Use
          </Link>
        </div>
        <div className={styles.socialIcons}>
          <Link
            href="https://github.com/LNCC/visualdynamics"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialIconLink}
          >
            <IconBrandGithub size={22} stroke={1.5} />
          </Link>
          {/* Add other social links if available */}
          {/* <a href="https://twitter.com/fiocruz" target="_blank" rel="noopener noreferrer" className={styles.socialIconLink}>
            <IconBrandTwitter size={22} stroke={1.5} />
          </a> */}
        </div>
      </div>
    </Box>
  );
}
