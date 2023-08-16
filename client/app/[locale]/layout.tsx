import { PropsWithChildren } from "react";
import { Simulate } from "react-dom/test-utils";
import { cookies } from "next/headers";

import { Providers } from "@/app/[locale]/providers";
import { Theme } from "@/contexts/theme";

import "./globals.css";
import toggle = Simulate.toggle;
import { AppLayout } from "@/components/Layouts/AppLayout";

type Props = {
  params: {
    locale: string;
  };
};

export default function RootLayout({
  children,
  params: { locale }
}: PropsWithChildren<Props>) {
  const defaultTheme = cookies().get("VISUALDYNAMICS_THEME")?.value as Theme;

  async function toggleThemeCookie() {
    "use server";
    const actualTheme = cookies().get("VISUALDYNAMICS_THEME")?.value as Theme;
    const newTheme = actualTheme === "light" ? "dark" : "light";

    cookies().set({
      name: "VISUALDYNAMICS_THEME",
      value: newTheme
    });

    return newTheme;
  }

  return (
    <html lang={locale}>
      <body>
        <Providers
          defaultTheme={defaultTheme}
          locale={locale}
          toggleThemeCookie={toggleThemeCookie}
        >
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
