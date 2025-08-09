import { Badge, Box, Text, UnstyledButton } from "@mantine/core";
import clsx from "clsx";
import { USER_ROLE } from "database";
import Link from "next/link";
import { usePathname } from "next/navigation";

import classes from "./Section.module.css";

interface Props {
  section: NavSection;
  toggle(): void;
  userRole?: USER_ROLE;
}

export function Section({ section, toggle, userRole }: Props) {
  const pathname = usePathname();

  return (
    <Box className={classes.sectionContainer}>
      <Text className={classes.sectionTitle}>{section.title}</Text>

      <Box className={classes.sectionLinksContainer}>
        {section.links.map((link) => {
          if (!link.role || link.role === userRole) {
            return (
              <UnstyledButton
                component={Link}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                href={section.disabled ? "#" : link.href}
                key={link.label}
                onClick={toggle}
                className={clsx(classes.linkContainer, {
                  [classes.linkActiveContainer]:
                    !section.disabled && pathname === link.href,
                })}
              >
                <div className={classes.linkInnerContainer}>
                  <link.icon
                    size={16}
                    className={classes.linkIcon}
                    stroke={1.5}
                  />
                  <span className={classes.linkLabel}>{link.label}</span>
                  {link.badge && (
                    <Badge
                      className={classes.badge}
                      color={link.badge.color}
                      variant="light"
                    >
                      {link.badge.message}
                    </Badge>
                  )}
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
