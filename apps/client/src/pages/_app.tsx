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

const navItems: NavItem[] = [
  {
    title: "Blog",
    isExternal: false,
    href: "/blog"
  }
];

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState("brand");

  return (
    <main
      className={`${inter.className}`}
      data-theme={theme}
    >
      <div className="flex h-screen flex-1 flex-col items-center font-inter text-white">
        <Suspense fallback={<div>Loading...</div>}>
          <Header
            setTheme={setTheme}
            items={navItems}
            theme={theme}
          />
          <section className="mt-10 max-w-2xl w-full px-4 pt-5 md:pt-10 flex flex-1 flex-col">
            <Component {...pageProps} />
          </section>
          <Footer />
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
