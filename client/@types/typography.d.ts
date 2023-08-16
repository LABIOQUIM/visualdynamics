import { ReactNode } from "react";

declare global {
  interface TypographyProps {
    className?: string;
    children: ReactNode;
  }
}
