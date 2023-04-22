import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from "next-i18next";
import NextNProgress from "nextjs-progressbar";

import { Layout } from "@app/components/Container/Layout";
import { ThemeProvider } from "@app/context/ThemeContext";
import { queryClient } from "@app/lib/query-client";

import "@app/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "900"],
  preload: false
});

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  if (typeof window === "undefined") React.useLayoutEffect = React.useEffect;

  return (
    <main className={`${inter.className}`}>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <NextNProgress
              height={5}
              showOnShallow
            />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ThemeProvider>
          {process.env.NODE_ENV === "development" ? (
            <ReactQueryDevtools />
          ) : null}
        </QueryClientProvider>
      </SessionProvider>

      {process.env.NODE_ENV === "production" ? (
        <>
          {/* Google tag (gtag.js) */}
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
      ) : null}
    </main>
  );
}

export default appWithTranslation(App);
