/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import cx from "clsx";
import type { ImageProps } from "next/image";
import NextLink from "next/link";

import { BlurImage } from "@app/components/BlurImage";
import { FOCUS_VISIBLE_OUTLINE, LINK_STYLES } from "@app/lib/constants";

export const components = {
  h1: (props: any) => (
    <h2
      className="mt-3 border-t-2 border-primary-800/5 pt-2.5 text-xl font-medium text-primary-900/90 dark:text-primary-400/90 sm:text-3xl"
      {...props}
    />
  ),
  h2: (props: any) => (
    <h3
      className="mt-3 border-t-2 border-primary-800/5 text-xl font-medium text-primary-900/90 dark:text-primary-400/90 sm:text-2xl"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h4
      className="text-xl font-medium text-primary-900/90 dark:text-primary-400/90"
      {...props}
    />
  ),
  h4: (props: any) => (
    <h5
      className="text-lg font-medium text-primary-900/90 dark:text-primary-400/90"
      {...props}
    />
  ),
  hr: (props: any) => (
    <hr
      className="relative border-t-2 border-primary-800/5 pt-9 sm:pt-10"
      {...props}
    />
  ),
  a: ({ href = "", ...props }) => {
    if (href.startsWith("http")) {
      return (
        <NextLink
          className={cx(LINK_STYLES, FOCUS_VISIBLE_OUTLINE)}
          href={href}
          target="_blank"
          rel="noreferrer"
          {...props}
        />
      );
    }

    return (
      <NextLink
        href={href}
        className={cx(LINK_STYLES, FOCUS_VISIBLE_OUTLINE)}
        {...props}
      />
    );
  },
  ul: (props: any) => (
    <ul
      className="my-1.5 flex flex-col gap-y-1.5 [&>li]:relative [&>li]:pl-5 before:[&>li]:absolute before:[&>li]:left-1 before:[&>li]:top-2.5 before:[&>li]:h-1.5 before:[&>li]:w-1.5 before:[&>li]:rounded-full before:[&>li]:bg-primary-900/75 dark:before:[&>li]:bg-primary-300/75 [li>&]:mt-3"
      {...props}
    />
  ),
  ol: (props: any) => (
    <ol
      className="list-decimal space-y-1 pl-10"
      {...props}
    />
  ),
  strong: (props: any) => (
    <strong
      className="font-semibold"
      {...props}
    />
  ),
  Img: ({
    bleed,
    caption,
    ...props
  }: {
    children: React.ReactNode;
    bleed?: boolean;
    caption?: string;
  } & ImageProps) => (
    <>
      <div
        className={cx({
          "xl:!col-start-2 xl:!col-end-4": bleed === true
        })}
      >
        <BlurImage
          className="w-full rounded object-contain"
          height={0}
          width={0}
          sizes="100vw"
          loading="lazy"
          {...props}
        />
      </div>
      {caption ? (
        <div className="mt-2 text-sm italic text-primary-900/60">{caption}</div>
      ) : null}
    </>
  ),
  blockquote: (props: any) => (
    <blockquote
      className="border-l-2 border-primary-800/10 pl-4 text-xl italic xl:!col-start-2 xl:!col-end-3"
      {...props}
    />
  ),
  del: (props: any) => (
    <del
      className="text-primary-900/70 line-through"
      {...props}
    />
  )
};
