import { PropsWithChildren } from "react";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { Metadata } from "next";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { GlobalLayout } from "@/components/Layout/GlobalLayout/GlobalLayout";
import { I18nProviderClient } from "@/locales/client";
import { theme } from "@/theme";

import "@mantine/core/styles.layer.css";
import "@mantine/dates/styles.layer.css";
import "@mantine/dropzone/styles.layer.css";
import "@mantine/notifications/styles.layer.css";
import "@mantine/charts/styles.layer.css";
import "mantine-react-table/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Visual Dynamics",
    template: "%s | Visual Dynamics",
  },
  description: "A portal to MD Simulations and Malaria studies.",
};

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function RootLayout({
  children,
  params,
}: PropsWithChildren<Props>) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      data-mantine-color-scheme="light"
      data-scroll-behavior="smooth"
    >
      <body>
        <I18nProviderClient locale={locale}>
          <MantineProvider forceColorScheme="light" theme={theme}>
            <DatesProvider
              settings={{
                firstDayOfWeek: 0,
                locale,
              }}
            >
              <Notifications position="top-right" />
              <GlobalLayout>
                <NuqsAdapter>{children}</NuqsAdapter>
              </GlobalLayout>
            </DatesProvider>
          </MantineProvider>
        </I18nProviderClient>
        {process.env.NODE_ENV !== "development" ? (
          <>
            <Script
              async
              defer
              src="https://www.googletagmanager.com/gtag/js?id=G-02198VT7VC"
            />
            <Script id="google-analytics" defer strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-02198VT7VC');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
