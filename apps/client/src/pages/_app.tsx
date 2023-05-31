import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { type AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";

import { PageLoadingIndicator } from "@app/components/Loading/PageLoadingIndicator";
import { queryClient } from "@app/lib/query-client";

import "@app/styles/globals.css";

const Layout = dynamic(
  () => import("@app/components/general/layout").then((mod) => mod.Layout),
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
        </QueryClientProvider>
      </SessionProvider>
    </>
  );
}
