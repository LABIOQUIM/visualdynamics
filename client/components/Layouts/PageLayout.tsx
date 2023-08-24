import { HTMLAttributes, PropsWithChildren } from "react";

import { cnMerge } from "@/utils/cnMerge";

type Props = HTMLAttributes<HTMLDivElement>;

export function PageLayout({
  children,
  className,
  ...rest
}: PropsWithChildren<Props>) {
  return (
    <div
      className={cnMerge(
        "flex flex-1 flex-col space-y-4 pb-4 lg:pb-0",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
