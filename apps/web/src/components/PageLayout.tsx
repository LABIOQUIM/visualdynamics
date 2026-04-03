import classes from "./PageLayout.module.css";

import { Box, type BoxProps } from "@mantine/core";
import clsx from "clsx";
import type { PropsWithChildren } from "react";

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
