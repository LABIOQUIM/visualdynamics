import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          rel="icon"
          href="/favicon.ico"
          sizes="any"
        />
      </Head>
      <body className="lg:overflow-y-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
