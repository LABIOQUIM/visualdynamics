import { Box, Text, UnstyledButton } from "@mantine/core";
import { USER_ROLE } from "database";
import Link from "next/link";

import classes from "./Section.module.css";

interface Props {
  section: NavSection;
  toggle(): void;
  userRole?: USER_ROLE;
}

export function Section({ section, toggle, userRole }: Props) {
  return (
    <Box className={classes.sectionContainer}>
      <Text className={classes.sectionTitle}>{section.title}</Text>

      <Box className={classes.sectionLinksContainer}>
        {section.links.map((link) => {
          if (!link.role || link.role === userRole) {
            return (
              <UnstyledButton
                component={Link}
                href={link.href}
                key={link.label}
                onClick={toggle}
                className={classes.linkContainer}
              >
                <div className={classes.linkInnerContainer}>
                  <link.icon
                    size={16}
                    className={classes.linkIcon}
                    stroke={1.5}
                  />
                  <span className={classes.linkLabel}>{link.label}</span>
                </div>
              </UnstyledButton>
            );
          }

          return undefined;
        })}
      </Box>
    </Box>
  );
}
