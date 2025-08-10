import { PropsWithChildren } from "react";

import { Shell } from "@/components/Layout/Shell/Shell";

export default async function RootAppLayout({ children }: PropsWithChildren) {
  return <Shell>{children}</Shell>;
}
