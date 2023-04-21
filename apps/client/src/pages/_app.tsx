import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from "next-i18next";

import { Header } from "@app/components/Layout/Header";
import { ThemeProvider } from "@app/contexts/theme";
import { queryClient } from "@app/lib/query-client";

import "@app/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "900"],
  preload: false
});

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <main className={`${inter.className}`}>
      <div className="h-screen font-inter">
        <SessionProvider session={session}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <div className="flex flex-col h-full gap-2.5 md:flex-row">
                <Header />
                <Component {...pageProps} />
              </div>
            </ThemeProvider>
            {process.env.NODE_ENV === "development" ? (
              <ReactQueryDevtools />
            ) : null}
          </QueryClientProvider>
        </SessionProvider>
      </div>

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
