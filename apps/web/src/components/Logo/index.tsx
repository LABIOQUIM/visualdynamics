import classes from "./Logo.module.css";

import { Box } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import LogoImage from "@/assets/visualdynamics.svg";

interface Props {
  size?: "normal" | "large";
}

export function Logo({ size = "normal" }: Props) {
  const isLarge = size === "large";
  return (
    <Box className={classes.container} component={Link} to="/">
      <img
        alt=""
        className={isLarge ? undefined : classes.logoImg}
        src={LogoImage}
        style={isLarge ? { height: 96, width: "auto" } : undefined}
      />
    </Box>
  );
}
