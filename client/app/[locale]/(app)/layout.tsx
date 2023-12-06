import { PropsWithChildren } from "react";
import { Metadata } from "next";
import { cookies } from "next/headers";

import { Providers } from "@/app/[locale]/(app)/providers";
import { AppLayout } from "@/components/Layouts/AppLayout";
import { Theme } from "@/contexts/theme";

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
      value: newTheme,
      path: "/",
      maxAge: 60 * 60 * 24 * 31 * 12
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
