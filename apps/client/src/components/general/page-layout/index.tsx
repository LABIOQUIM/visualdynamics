import { PropsWithChildren } from "react";

export function PageLayout({ children }: PropsWithChildren<unknown>) {
  return <div className="space-y-4 pb-4 lg:pb-0">{children}</div>;
}
