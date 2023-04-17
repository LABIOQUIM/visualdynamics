import React, { Suspense, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Script from "next/script";
import { appWithTranslation } from "next-i18next";

import { Footer } from "@app/components/Layout/Footer";
import { Header } from "@app/components/Layout/Header";
import { queryClient } from "@app/lib/query-client";

import "@app/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "900"],
  preload: false
});

function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState("brand");

  return (
    <main
      className={`${inter.className}`}
      data-theme={theme}
    >
      <div className="h-screen font-inter transition-all duration-1000">
        <Suspense fallback={<div>Loading...</div>}>
          <QueryClientProvider client={queryClient}>
            <div className="flex flex-col h-full gap-2 md:flex-row">
              <Header
                setTheme={setTheme}
                theme={theme}
              />
              <div className="flex flex-col flex-1 max-h-full">
                {/* BREADCRUMB */}
                <Component {...pageProps} />
                <Footer />
              </div>
            </div>
            {process.env.NODE_ENV === "development" ? (
              <ReactQueryDevtools />
            ) : null}
          </QueryClientProvider>
        </Suspense>
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
