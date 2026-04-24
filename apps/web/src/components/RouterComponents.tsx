import React from "react";
import {
  ActionIcon,
  type ActionIconProps,
  Button,
  type ButtonProps,
} from "@mantine/core";
import { createLink, type LinkProps } from "@tanstack/react-router";

const ActionIconLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  LinkProps & ActionIconProps
>((props, ref) => <ActionIcon ref={ref as React.Ref<HTMLButtonElement>} {...props} />);
ActionIconLinkComponent.displayName = "ActionIconLink";

const ButtonLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  LinkProps & ButtonProps
>((props, ref) => <Button ref={ref as React.Ref<HTMLButtonElement>} {...props} />);
ButtonLinkComponent.displayName = "ButtonLink";

export const ActionIconLink = createLink(ActionIconLinkComponent);
export const ButtonLink = createLink(ButtonLinkComponent);
