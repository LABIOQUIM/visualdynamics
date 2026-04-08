import classes from "./PageLayout.module.css";

import type { PropsWithChildren } from "react";
import { Box, type BoxProps } from "@mantine/core";
import clsx from "clsx";

export function PageLayout({
  children,
  className,
  ...props
}: PropsWithChildren<BoxProps>) {
  return (
    <Box className={clsx(classes.container, className)} {...props}>
      {children}
    </Box>
  );
}
