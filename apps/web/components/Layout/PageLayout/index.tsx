import { PropsWithChildren } from "react";
import { Box, BoxProps } from "@mantine/core";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";

import classes from "./PageLayout.module.css";

export function PageLayout({ children }: PropsWithChildren<BoxProps>) {
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Box className={classes.container}>{children}</Box>
    </HydrationBoundary>
  );
}
