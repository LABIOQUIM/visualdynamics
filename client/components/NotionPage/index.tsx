"use client";
import * as React from "react";
import { NotionRenderer } from "react-notion-x";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ExtendedRecordMap } from "notion-types";

import "react-notion-x/src/styles.css";
// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then(async (m) => {
    // additional prism syntaxes
    // await Promise.all([
    //   import("prismjs/components/prism-markup-templating.js"),
    //   import("prismjs/components/prism-markup.js"),
    //   import("prismjs/components/prism-bash.js"),
    //   import("prismjs/components/prism-c.js"),
    //   import("prismjs/components/prism-cpp.js"),
    //   import("prismjs/components/prism-csharp.js"),
    //   import("prismjs/components/prism-docker.js"),
    //   import("prismjs/components/prism-java.js"),
    //   import("prismjs/components/prism-js-templates.js"),
    //   import("prismjs/components/prism-coffeescript.js"),
    //   import("prismjs/components/prism-diff.js"),
    //   import("prismjs/components/prism-git.js"),
    //   import("prismjs/components/prism-go.js"),
    //   import("prismjs/components/prism-graphql.js"),
    //   import("prismjs/components/prism-handlebars.js"),
    //   import("prismjs/components/prism-less.js"),
    //   import("prismjs/components/prism-makefile.js"),
    //   import("prismjs/components/prism-markdown.js"),
    //   import("prismjs/components/prism-objectivec.js"),
    //   import("prismjs/components/prism-ocaml.js"),
    //   import("prismjs/components/prism-python.js"),
    //   import("prismjs/components/prism-reason.js"),
    //   import("prismjs/components/prism-rust.js"),
    //   import("prismjs/components/prism-sass.js"),
    //   import("prismjs/components/prism-scss.js"),
    //   import("prismjs/components/prism-solidity.js"),
    //   import("prismjs/components/prism-sql.js"),
    //   import("prismjs/components/prism-stylus.js"),
    //   import("prismjs/components/prism-swift.js"),
    //   import("prismjs/components/prism-wasm.js"),
    //   import("prismjs/components/prism-yaml.js")
    // ]);
    return m.Code;
  })
);
const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection
  )
);
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
);
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  {
    ssr: false
  }
);

export default function NotionPage({
  recordMap,
  previewImagesEnabled,
  rootPageId,
  rootDomain
}: {
  recordMap: ExtendedRecordMap;
  previewImagesEnabled?: boolean;
  rootPageId?: string;
  rootDomain?: string;
}) {
  if (!recordMap) {
    return null;
  }

  // useful for debugging from the dev console
  if (typeof window !== "undefined") {
    const keys = Object.keys(recordMap?.block || {});
    const block = recordMap?.block?.[keys[0]]?.value;
    const g = window as any;
    g.recordMap = recordMap;
    g.block = block;
  }

  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={true}
      rootDomain={rootDomain}
      rootPageId={rootPageId}
      previewImages={previewImagesEnabled}
      components={{
        // NOTE (transitive-bullshit 3/12/2023): I'm disabling next/image for this repo for now because the amount of traffic started costing me hundreds of dollars a month in Vercel image optimization costs. I'll probably re-enable it in the future if I can find a better solution.
        nextImage: Image,
        nextLink: Link,
        Code,
        Collection,
        Equation,
        Modal,
        PageLink: ({
          className,
          href,
          children
        }: {
          className: string;
          href: string;
          children: React.ReactElement;
        }) => {
          return (
            <Link
              className={className}
              href={`/docs${href}`}
            >
              {children}
            </Link>
          );
        }
      }}

      // NOTE: custom images will only take effect if previewImages is true and
      // if the image has a valid preview image defined in recordMap.preview_images[src]
    />
  );
}
