import type { PropsWithChildren, ReactNode } from "react";

import { Anchor, Box, Breadcrumbs, Title, type BoxProps } from "@mantine/core";
import { Link, useMatches } from "@tanstack/react-router";
import clsx from "clsx";

import classes from "./PageLayout.module.css";

interface PageLayoutProps extends Omit<BoxProps, "title"> {
  centered?: boolean;
  rightElement?: ReactNode;
  title: string;
}

type ResolvedBreadcrumbItem = {
  path: string;
  label: string;
};

export function PageLayout({
  centered,
  children,
  className,
  rightElement,
  title,
  ...props
}: PropsWithChildren<PageLayoutProps>) {
  const matches = useMatches();

  const breadcrumbs: ResolvedBreadcrumbItem[] = matches.flatMap((match) => {
    const staticData = match.staticData;
    if (!staticData?.breadcrumb) return [];

    const breadcrumbValue =
      typeof staticData.breadcrumb === "function"
        ? staticData.breadcrumb(match)
        : staticData.breadcrumb;

    const items = Array.isArray(breadcrumbValue)
      ? breadcrumbValue
      : [breadcrumbValue];

    return items.map((item) => ({
      label: item,
      path: match.pathname,
    }));
  });

  return (
    <Box className={classes.root}>
      <div className={classes.heading}>
        {breadcrumbs.length > 0 ? (
          <Breadcrumbs className={classes.breadcrumbs} separator="/">
            {breadcrumbs.map((breadcrumb) => (
              <Anchor
                className={classes.breadcrumbLink}
                component={Link}
                key={breadcrumb.path}
                size="sm"
                to={breadcrumb.path}
              >
                <span className={classes.breadcrumbContent}>
                  <span>{breadcrumb.label}</span>
                </span>
              </Anchor>
            ))}
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
