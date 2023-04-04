import React from "react";
import cx from "clsx";
import type { ImageProps } from "next/image";
import NextImage from "next/image";

export function BlurImage({ className, ...rest }: ImageProps) {
  const [isLoading, setLoading] = React.useState(true);

  return (
    <div
      className={cx(
        "relative flex overflow-hidden mx-auto rounded-xl bg-white/[2%] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-xl after:border after:border-primary-200/10 after:content-['']",
        isLoading ? "animate-pulse" : "",
        className
      )}
    >
      <NextImage
        {...rest}
        className={cx(
          "rounded-xl duration-700 ease-in-out",
          isLoading
            ? "scale-[1.02] blur-xl grayscale"
            : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoadingComplete={() => setLoading(false)}
      />
    </div>
  );
}
