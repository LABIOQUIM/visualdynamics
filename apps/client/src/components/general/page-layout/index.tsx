import { PropsWithChildren } from "react";

export function PageLayout({ children }: PropsWithChildren<unknown>) {
  return <div className="space-y-4">{children}</div>;
}
