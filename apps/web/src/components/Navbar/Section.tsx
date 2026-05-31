import classes from "./Section.module.css";

import { Badge, Box, Collapse, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { useEffect, useState } from "react";

import { parsePathname } from "@/lib/utils";

interface Props {
  section: NavSection;
  toggle(): void;
}

function isActive(pathname: string, href: NavChildLink["href"] | undefined) {
  return pathname === href;
}

function isLinkGroupActive(pathname: string, link: NavLink) {
  return (
    isActive(pathname, link.href) ||
    Boolean(link.children?.some((child) => isActive(pathname, child.href)))
  );
}

function getActiveLinkGroupLabel(section: NavSection, pathname: string) {
  return section.links.find((link) => link.children?.length && isLinkGroupActive(pathname, link))
    ?.label;
}

function NavLinkItem({
  disabled,
  isChild,
  link,
  pathname,
  toggle,
}: {
  disabled: boolean;
  isChild?: boolean;
  link: NavChildLink;
  pathname: string;
  toggle(): void;
}) {
  return (
    <UnstyledButton
      className={clsx(classes.linkContainer, {
        [classes.childLinkContainer]: isChild,
        [classes.linkActiveContainer]: !disabled && isActive(pathname, link.href),
      })}
      component={Link}
      onClick={toggle}
      {...(link.external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      preload={link.external || disabled ? false : "render"}
      to={disabled ? "#" : (link.href ?? "#")}
    >
      <div className={classes.linkInnerContainer}>
        <link.icon className={classes.linkIcon} size={16} stroke={1.5} />
        <span className={classes.linkLabel}>{link.label}</span>
        {link.badge && (
          <Badge className={classes.badge} color={link.badge.color} variant="light">
            {link.badge.message}
          </Badge>
        )}
      </div>
    </UnstyledButton>
  );
}

function NavAccordionControl({
  disabled,
  isActive,
  isOpen,
  link,
  onClick,
}: {
  disabled: boolean;
  isActive: boolean;
  isOpen: boolean;
  link: NavLink;
  onClick(): void;
}) {
  return (
    <UnstyledButton
      aria-expanded={isOpen}
      className={clsx(classes.linkContainer, classes.accordionControl, {
        [classes.linkActiveContainer]: !disabled && isActive,
      })}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <div className={classes.linkInnerContainer}>
        <link.icon className={classes.linkIcon} size={16} stroke={1.5} />
        <span className={classes.linkLabel}>{link.label}</span>
        {link.badge && (
          <Badge className={classes.badge} color={link.badge.color} variant="light">
            {link.badge.message}
          </Badge>
        )}
        <IconChevronDown
          className={classes.accordionChevron}
          data-open={isOpen}
          size={14}
          stroke={1.5}
        />
      </div>
    </UnstyledButton>
  );
}

export function Section({ section, toggle }: Props) {
  const pathname = useLocation({
    select: (location) => parsePathname(location.pathname),
  });
  const [openLinkLabel, setOpenLinkLabel] = useState<string | null>(
    () => getActiveLinkGroupLabel(section, pathname) ?? null,
  );

  useEffect(() => {
    const activeLinkGroupLabel = getActiveLinkGroupLabel(section, pathname);

    if (activeLinkGroupLabel) {
      setOpenLinkLabel(activeLinkGroupLabel);
    }
  }, [pathname, section]);

  return (
    <Box className={classes.sectionContainer}>
      <Text className={classes.sectionTitle}>{section.title}</Text>

      <Box className={classes.sectionLinksContainer}>
        {section.links.map((link) => {
          const hasChildren = Boolean(link.children?.length);
          const disabled = Boolean(section.disabled || link.disabled);
          const isOpen = openLinkLabel === link.label;

          return (
            <div className={classes.linkGroup} key={link.label}>
              {hasChildren ? (
                <NavAccordionControl
                  disabled={disabled}
                  isActive={isLinkGroupActive(pathname, link)}
                  isOpen={isOpen}
                  link={link}
                  onClick={() => setOpenLinkLabel(isOpen ? null : link.label)}
                />
              ) : (
                <NavLinkItem
                  disabled={disabled}
                  link={link}
                  pathname={pathname}
                  toggle={toggle}
                />
              )}

              {hasChildren ? (
                <Collapse expanded={isOpen}>
                  <div className={classes.childLinksContainer}>
                    {link.children?.map((child) => (
                      <NavLinkItem
                        disabled={Boolean(disabled || child.disabled)}
                        isChild
                        key={child.label}
                        link={child}
                        pathname={pathname}
                        toggle={toggle}
                      />
                    ))}
                  </div>
                </Collapse>
              ) : null}
            </div>
          );
        })}
      </Box>
    </Box>
  );
}
