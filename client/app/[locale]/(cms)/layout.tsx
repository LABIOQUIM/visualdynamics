import { PropsWithChildren } from "react";
import { Metadata } from "next";

import Header from "@/app/[locale]/(cms)/Header";

import "./cms.css";

export const metadata: Metadata = {
  title: {
    default: "Docs",
    template: "%s | Docs | VisualDynamics"
  }
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
