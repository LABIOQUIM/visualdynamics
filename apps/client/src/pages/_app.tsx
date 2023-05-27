import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getCookie, hasCookie } from "cookies-next";
import { type AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

import { PageLoadingIndicator } from "@app/components/Loading/PageLoadingIndicator";
import {
  Theme,
  themeCookieKey,
  ThemeProvider
} from "@app/context/ThemeContext";
import { queryClient } from "@app/lib/query-client";

import "@app/styles/globals.css";

const Layout = dynamic(
  () => import("@app/components/Container/Layout").then((mod) => mod.Layout),
  {
    loading: () => (
      <div className="h-screen">
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
  const defaultTheme = hasCookie(themeCookieKey)
    ? getCookie(themeCookieKey)
    : "light";

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </Head>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme={defaultTheme as Theme}>
            <NextNProgress
              height={5}
              color="#22c55e"
              options={{ showSpinner: false }}
            />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ThemeProvider>
          {process.env.NODE_ENV === "development" ? (
            <ReactQueryDevtools />
          ) : null}
        </QueryClientProvider>
        {/* {process.env.NODE_ENV === "production" ? (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-HZC72N296P"
            strategy="afterInteractive"
          />
          <Script
            id="gtag"
            strategy="afterInteractive"
          >
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
    
              gtag('config', 'G-HZC72N296P');
            `}
          </Script>
        </>
      ) : null} */}
      </SessionProvider>
    </>
  );
}
