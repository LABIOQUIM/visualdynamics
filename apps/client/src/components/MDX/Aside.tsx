import React from "react";
import clsx from "clsx";

export function Aside({
  children,
  position = "left",
  styled = false,
  title
}: {
  children: React.ReactNode;
  position?: "left" | "right";
  styled?: boolean;
  title?: string;
}) {
  return (
    <div
      className={clsx("relative", {
        "xl:!col-start-2": position === "left",
        "xl:!col-start-4": position === "right"
      })}
    >
      <div
        className={clsx("relative xl:absolute xl:left-0 xl:right-0 xl:top-0", {
          "z-10 border-l-2 border-primary-200/5 bg-gray-900 pl-4 shadow-[0_0_30px_20px] shadow-gray-900 xl:border-l-0 xl:border-t-2 xl:py-6 xl:pl-0":
            styled
        })}
      >
        {title ? (
          <div className="mb-2 text-base italic text-opacity-100">{title}</div>
        ) : null}
        <div
          className={clsx({
            "text-sm italic text-primary-100/60 [&>span[data-rehype-pretty-code-fragment]]:!text-[11px]":
              styled
          })}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
