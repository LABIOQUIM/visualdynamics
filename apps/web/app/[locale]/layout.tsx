import { PropsWithChildren } from "react";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { Metadata } from "next";
import dynamic from "next/dynamic";

import { EmailValidationModal } from "@/components/Auth/EmailValidationModal";
import { validateRequest } from "@/lib/lucia";
import { I18nProviderClient } from "@/locales/client";
import { theme } from "@/theme";

import "@mantine/core/styles.layer.css";
import "@mantine/dates/styles.layer.css";
import "@mantine/dropzone/styles.layer.css";
import "@mantine/notifications/styles.layer.css";
import "@mantine/charts/styles.layer.css";

const Shell = dynamic(() => import("@/components/Layout/Shell"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: {
    default: "Visual Dynamics",
    template: "%s | Visual Dynamics",
  },
  description: "A portal to MD Simulations and Malaria studies.",
};

interface Props {
  params: {
    locale: string;
  };
}

export default async function RootLayout({
  children,
  params,
}: PropsWithChildren<Props>) {
  const { session, user } = await validateRequest();

  return (
    <html lang={params.locale}>
      <body>
        <I18nProviderClient locale={params.locale}>
          <MantineProvider theme={theme}>
            <DatesProvider
              settings={{
                firstDayOfWeek: 0,
                locale: params.locale,
              }}
            >
              <Notifications position="top-right" />
              <Shell session={session} user={user}>
                {children}
                <EmailValidationModal />
              </Shell>
            </DatesProvider>
          </MantineProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
