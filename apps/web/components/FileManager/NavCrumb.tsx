"use client";

import { Fragment } from "react";
import { Text, UnstyledButton } from "@mantine/core";

import classes from "./FileManager.module.css";

interface Props {
  crumb: string;
  isLastCrumb: boolean;
  onClick: () => void;
}

export function NavCrumb({ crumb, isLastCrumb, onClick }: Props) {
  return (
    <Fragment>
      <UnstyledButton className={classes.breadcrumb} onClick={onClick}>
        <Text className={classes.breadcrumbText}>{crumb}</Text>
      </UnstyledButton>
      {!isLastCrumb && <div className={classes.breadcrumbText}>/</div>}
    </Fragment>
  );
}
