/* eslint-disable react/destructuring-assignment */
import React from "react";
import cx from "clsx";
import { FileText, Folder } from "lucide-react";

type Node = {
  name: string;
  isHighlighted?: boolean;
  children?: Node[];
};

function Inner({ data, lvl }: { data: Node[]; lvl: number }) {
  return (
    <>
      {data.map((node) => (
        <React.Fragment key={node.name}>
          <div
            className={cx(
              "flex items-center space-x-2 border-l-4 border-l-transparent pr-4 before:mr-4 before:ml-2 before:inline-block before:w-4 before:text-right before:[counter-increment:line] before:[content:counter(line)]",
              {
                "border-l-primary-300/70 bg-primary-200/10 before:text-white/70":
                  node.isHighlighted,
                "before:text-white/20": !node.isHighlighted
              }
            )}
          >
            <div
              className={cx("text-primary-100/40", {
                "pl-[20px]": lvl === 1,
                "pl-[40px]": lvl === 2,
                "pl-[60px]": lvl === 3,
                "pl-[80px]": lvl === 4
              })}
            >
              {!node.children ? (
                <FileText className="w-4" />
              ) : (
                <Folder className="w-4" />
              )}
            </div>
            <div
              className={cx(
                node.isHighlighted ? "text-primary-50" : "text-primary-100/90"
              )}
            >
              {node.name}
            </div>
          </div>

          {node.children ? (
            <Inner
              data={node.children}
              lvl={lvl + 1}
            />
          ) : null}
        </React.Fragment>
      ))}
    </>
  );
}

export function Files(props: { data: Node[]; title?: string }) {
  return (
    <div className="shadow-surface-elevation-low overflow-hidden rounded-md bg-white/5 font-mono">
      {props.title ? (
        <div className="mb-0.5 rounded-md bg-primary-100/10 px-3 py-1 text-xs text-primary-100/70 shadow-sm">
          {props.title}
        </div>
      ) : null}
      <div className="py-3 text-[13px] leading-6 [counter-reset:line]">
        <Inner
          {...props}
          lvl={0}
        />
      </div>
    </div>
  );
}
