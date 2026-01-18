import classes from "./Logo.module.css";

import { Box } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import LogoImage from "@/assets/visualdynamics.svg";

interface Props {
  size?: "normal" | "large";
}

export function Logo({ size = "normal" }: Props) {
  const height = {
    normal: 48,
    large: 96,
  };
  return (
    <Box className={classes.container} component={Link} to="/">
      <img
        alt=""
        src={LogoImage}
        style={{ height: height[size], width: "auto" }}
      />
    </Box>
  );
}
