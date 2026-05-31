import type { PropsWithChildren, ReactNode } from "react";

import { Anchor, Box, Breadcrumbs, Text, Title, type BoxProps } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { Link, type LinkProps, useLocation } from "@tanstack/react-router";
import clsx from "clsx";

import { parsePathname } from "@/lib/utils";

import classes from "./PageLayout.module.css";

const SEGMENT_LABELS: Record<string, string> = {
  app: "Home",
  submit: "New Simulation",
  simulations: "Simulations",
  mgmt: "Management",
  users: "Users",
  server: "Server Statistics",
  tools: "Management Tools",
  "simulation-importer": "Simulation Importer",
  "user-importer": "User Importer",
  "batch-email": "Batch Email",
  "feature-flags": "Feature Flags",
  settings: "Settings",
};

type BreadcrumbHref = Exclude<LinkProps["to"], undefined>;

const LINKABLE_BREADCRUMB_PATHS = {
  "/app": true,
  "/app/submit": true,
  "/app/mgmt": true,
  "/app/mgmt/users": true,
  "/app/mgmt/simulations": true,
  "/app/mgmt/server": true,
  "/app/mgmt/tools": true,
  "/app/mgmt/tools/simulation-importer": true,
  "/app/mgmt/tools/user-importer": true,
  "/app/mgmt/tools/batch-email": true,
  "/app/mgmt/feature-flags": true,
  "/app/mgmt/feature-flags/new": true,
  "/app/mgmt/settings": true,
} satisfies Partial<Record<BreadcrumbHref, true>>;

type LinkableBreadcrumbHref = keyof typeof LINKABLE_BREADCRUMB_PATHS;

interface BreadcrumbItem {
  href: LinkableBreadcrumbHref | undefined;
  isHome: boolean;
  isCurrent: boolean;
  label: string;
}

interface PageLayoutProps extends Omit<BoxProps, "title"> {
  centered?: boolean;
  rightElement?: ReactNode;
  title: string;
}

function getFallbackLabel(segment: string) {
  return decodeURIComponent(segment)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isLinkableBreadcrumbHref(href: string): href is LinkableBreadcrumbHref {
  return href in LINKABLE_BREADCRUMB_PATHS;
}

function buildBreadcrumbs(pathname: string, title: string): BreadcrumbItem[] {
  const normalizedPathname = parsePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const appBaseSegments = segments[0] === "app" ? ["app"] : [];
  const breadcrumbSegments = appBaseSegments.length > 0 ? segments.slice(1) : segments;

  const home: BreadcrumbItem = {
    href: breadcrumbSegments.length > 0 ? "/app" : undefined,
    isHome: true,
    isCurrent: breadcrumbSegments.length === 0,
    label: "Home",
  };

  const pathBreadcrumbs = breadcrumbSegments.map((segment, index) => {
    const href = `/${[...appBaseSegments, ...breadcrumbSegments.slice(0, index + 1)].join("/")}`;
    const isCurrent = index === breadcrumbSegments.length - 1;

    return {
      href: !isCurrent && isLinkableBreadcrumbHref(href) ? href : undefined,
      isHome: false,
      isCurrent,
      label: isCurrent ? title : SEGMENT_LABELS[segment] ?? getFallbackLabel(segment),
    };
  });

  return [home, ...pathBreadcrumbs];
}

function BreadcrumbLabel({ isHome, label }: Pick<BreadcrumbItem, "isHome" | "label">) {
  return (
    <span className={classes.breadcrumbContent}>
      {isHome ? <IconHome aria-hidden className={classes.breadcrumbIcon} size={14} /> : null}
      <span>{label}</span>
    </span>
  );
}

export function PageLayout({
  centered,
  children,
  className,
  rightElement,
  title,
  ...props
}: PropsWithChildren<PageLayoutProps>) {
  const breadcrumbs = useLocation({
    select: (location) => buildBreadcrumbs(location.pathname, title),
  });

  return (
    <Box className={classes.root}>
      <div className={classes.heading}>
        {breadcrumbs.length > 0 ? (
          <Breadcrumbs className={classes.breadcrumbs} separator="/">
            {breadcrumbs.map((breadcrumb, index) =>
              breadcrumb.href ? (
                <Anchor
                  className={classes.breadcrumbLink}
                  component={Link}
                  key={breadcrumb.href}
                  size="sm"
                  to={breadcrumb.href}
                >
                  <BreadcrumbLabel isHome={breadcrumb.isHome} label={breadcrumb.label} />
                </Anchor>
              ) : (
                <Text
                  className={classes.breadcrumbCurrent}
                  key={`${breadcrumb.label}-${index}`}
                  size="sm"
                  {...(breadcrumb.isCurrent ? { c: "dimmed" as const } : {})}
                >
                  <BreadcrumbLabel isHome={breadcrumb.isHome} label={breadcrumb.label} />
                </Text>
              ),
            )}
          </Breadcrumbs>
        ) : null}

        <div className={classes.headingRow} data-centered={centered}>
          <Title order={2}>{title}</Title>
          {rightElement ? (
            <div className={classes.rightElementContainer}>{rightElement}</div>
          ) : null}
        </div>
      </div>

      <Box className={clsx(classes.container, className)} {...props}>
        {children}
      </Box>
    </Box>
  );
}
