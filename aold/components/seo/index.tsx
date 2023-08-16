import Head from "next/head";
import { useRouter } from "next/router";

export function SEO({ title, description, ogImage }: SEOProps) {
  const hostname = typeof window !== "undefined" ? window.origin : "";
  const { pathname } = useRouter();

  return (
    <Head>
      <title>{`${pathname !== "/" ? title + " •" : ""} Visual Dynamics`}</title>
      <meta
        name="title"
        content={title}
      />
      <meta
        property="og:title"
        content={title}
      />
      <meta
        property="twitter:title"
        content={title}
      />

      {description ? (
        <>
          <meta
            name="description"
            content={description}
          />
          <meta
            property="og:description"
            content={description}
          />
          <meta
            property="twitter:description"
            content={description}
          />
        </>
      ) : null}

      {ogImage ? (
        <>
          <meta
            property="og:image"
            content={`${hostname}${ogImage}`}
          />
          <meta
            property="twitter:image"
            content={`${hostname}${ogImage}`}
          />
        </>
      ) : null}

      <meta
        property="og:type"
        content="website"
      />
      <meta
        property="og:url"
        content={hostname}
      />

      <meta
        property="twitter:card"
        content="summary_large_image"
      />
      <meta
        property="twitter:url"
        content={hostname}
      />

      <link
        rel="icon"
        href="/client/public/favicon.ico"
      />
    </Head>
  );
}
