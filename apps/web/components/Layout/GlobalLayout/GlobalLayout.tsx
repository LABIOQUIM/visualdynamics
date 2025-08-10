"use client";
import { PropsWithChildren } from "react";
import { ProgressProvider } from "@bprogress/next/app";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";

export function GlobalLayout({ children }: PropsWithChildren) {
  return (
    <ProgressProvider
      height="4px"
      color="#fffd00"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ProgressProvider>
  );
}
