import type { AnyRouteMatch } from "@tanstack/react-router";

declare global {
  type BreadcrumbValue =
    | string
    | string[]
    | ((match: AnyRouteMatch) => string | string[]);
}
