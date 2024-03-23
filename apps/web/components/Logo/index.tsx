import { Box, Title } from "@mantine/core";
import { IconDeviceDesktopAnalytics } from "@tabler/icons-react";
import Link from "next/link";

import classes from "./Logo.module.css";

interface Props {
  size?: "normal" | "large";
}

export function Logo({ size = "normal" }: Props) {
  const titleStyles = {
    normal: classes.title,
    large: classes.titleLarge,
  };

  const iconSizes = {
    normal: 24,
    large: 48,
  };

  return (
    <Box component={Link} href="/" className={classes.container}>
      <IconDeviceDesktopAnalytics size={iconSizes[size]} />
      <Title className={titleStyles[size]}>LABIOQUIM</Title>
    </Box>
  );
}
