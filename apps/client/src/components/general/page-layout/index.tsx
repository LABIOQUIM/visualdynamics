import { PropsWithChildren } from "react";

export function PageLayout({ children }: PropsWithChildren<unknown>) {
  return (
    <div className="flex flex-1 flex-col space-y-4 pb-4 lg:pb-0">
      {children}
    </div>
  );
}
