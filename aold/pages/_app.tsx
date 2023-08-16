import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { type AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";

import { PageLoadingIndicator } from "aold/components/general/loading-indicator/full-page";
import { SettingsProvider } from "aold/context/SettingsContext";
import { SidebarProvider } from "aold/context/SidebarContext";
import { queryClient } from "../lib/query-client";

import "@app/styles/globals.css";

const Layout = dynamic(
  () => import("aold/components/general/layout").then((mod) => mod.Layout),
  {
    loading: () => (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <PageLoadingIndicator />
      </div>
    ),
    ssr: false
  }
);

const NextNProgress = dynamic(() => import("next-progress"), {
  ssr: false
});

const ReactQueryDevtools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then(
      (mod) => mod.ReactQueryDevtools
    ),
  {
    ssr: false
  }
);

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  if (typeof window === "undefined") React.useLayoutEffect = React.useEffect;

  return (
    <>
      <Head>
        <title>Visual Dynamics</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </Head>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <SidebarProvider>
              <NextNProgress
                height={5}
                color="#22c55e"
                options={{ showSpinner: false }}
              />
              <Layout>
                <Component {...pageProps} />
              </Layout>
              {process.env.NODE_ENV === "development" ? (
                <ReactQueryDevtools />
              ) : null}
            </SidebarProvider>
          </SettingsProvider>
        </QueryClientProvider>
        {process.env.NODE_ENV !== "development" ? (
          <>
            <Script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-02198VT7VC"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
            >
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-02198VT7VC');
              `}
            </Script>
          </>
        ) : null}
      </SessionProvider>
    </>
  );
}
