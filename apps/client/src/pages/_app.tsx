import React, { Suspense, useState } from "react";
import { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Script from "next/script";

import { Footer } from "@app/components/Layout/Footer";
import { Header } from "@app/components/Layout/Header";

import "@app/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "900"],
  preload: false
});

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState("brand");

  return (
    <main
      className={`${inter.className}`}
      data-theme={theme}
    >
      <div className="h-screen flex-1 font-inter">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex flex-col h-full flex-1 gap-2 md:flex-row md:h-full">
            <Header
              setTheme={setTheme}
              theme={theme}
            />
            <div className="flex flex-col flex-1">
              {/* BREADCRUMB */}
              <Footer />
              <section className="flex flex-1 flex-col rounded-lg bg-zinc-800/10 px-4 pt-5 mr-2">
                <Component {...pageProps} />
              </section>
              <Footer />
            </div>
          </div>
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
