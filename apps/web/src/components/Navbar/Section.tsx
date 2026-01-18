import classes from "./Section.module.css";

import { Badge, Box, Text, UnstyledButton } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";

import { parsePathname } from "@/lib/utils";

interface Props {
  section: NavSection;
  toggle(): void;
  userRole?: string;
}

export function Section({ section, toggle, userRole }: Props) {
  const pathname = useLocation({
    select: (location) => parsePathname(location.pathname),
  });

  return (
    <Box className={classes.sectionContainer}>
      <Text className={classes.sectionTitle}>{section.title}</Text>

      <Box className={classes.sectionLinksContainer}>
        {section.links.map((link) => {
          if (!link.role || link.role === userRole) {
            return (
              <UnstyledButton
                className={clsx(classes.linkContainer, {
                  [classes.linkActiveContainer]:
                    !section.disabled && pathname === link.href,
                })}
                component={Link}
                key={link.label}
                onClick={toggle}
                rel={link.external ? "noopener noreferrer" : undefined}
                target={link.external ? "_blank" : undefined}
                to={section.disabled ? "#" : link.href}
              >
                <div className={classes.linkInnerContainer}>
                  <link.icon
                    className={classes.linkIcon}
                    size={16}
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
