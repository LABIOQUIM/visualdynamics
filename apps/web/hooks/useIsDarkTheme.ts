"use client";
import { useMantineColorScheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export function useIsDarkTheme() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const { colorScheme } = useMantineColorScheme();

  return (colorScheme === "auto" && prefersDarkMode) || colorScheme === "dark";
}
