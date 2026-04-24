import classes from "./Section.module.css";

import { Badge, Box, Text, UnstyledButton } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";

import { parsePathname } from "@/lib/utils";

interface Props {
  section: NavSection;
  toggle(): void;
}

export function Section({ section, toggle }: Props) {
  const pathname = useLocation({
    select: (location) => parsePathname(location.pathname),
  });

  return (
    <Box className={classes.sectionContainer}>
      <Text className={classes.sectionTitle}>{section.title}</Text>

      <Box className={classes.sectionLinksContainer}>
        {section.links.map((link) => (
          <UnstyledButton
            className={clsx(classes.linkContainer, {
              [classes.linkActiveContainer]:
                !section.disabled && pathname === link.href,
            })}
            component={Link}
            key={link.label}
            onClick={toggle}
            {...(link.external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
            to={section.disabled ? "#" : (link.href ?? "#")}
          >
            <div className={classes.linkInnerContainer}>
              <link.icon className={classes.linkIcon} size={16} stroke={1.5} />
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
        ))}
      </Box>
    </Box>
  );
}
