import { PropsWithChildren } from "react";
import { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Visual Dynamics",
    template: "%s | Visual Dynamics"
  }
};

type Props = {
  params: {
    locale: string;
  };
};

export default function Layout({
  children,
  params: { locale }
}: PropsWithChildren<Props>) {
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
