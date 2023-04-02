/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Options } from "rehype-pretty-code";
import { visit } from "unist-util-visit";

// div.BLOCK > pre.PRE > code.CODE
const BLOCK =
  "rounded-lg my-5 overflow-x-auto bg-primary-900/10 shadow-surface-elevation-low ring-1 ring-primary-100/5 ring-inset";
const TITLE =
  "mb-0.5 rounded-md rounded-b-none bg-primary-100/10 px-3 py-2 font-mono text-xs text-primary-100/70 shadow-sm";
const PRE = "overflow-x-auto py-2 text-[13px] leading-6 [color-scheme:dark]";
const CODE =
  "grid [&>span]:border-l-4 [&>span]:border-l-transparent [&>span]:pl-2 [&>span]:pr-3";
const INLINE_BLOCK =
  "whitespace-nowrap border border-primary-200/10 px-1.5 py-px text-[12px] rounded-full bg-white/5 whitespace-nowrap text-primary-300/90";
const INLINE_CODE = "";
const NUMBERED_LINES =
  "[counter-reset:line] before:[&>span]:mr-3 before:[&>span]:inline-block before:[&>span]:w-4 before:[&>span]:text-right before:[&>span]:text-white/20 before:[&>span]:![content:counter(line)] before:[&>span]:[counter-increment:line]";
const HIGHLIGHTED_LINE =
  "!border-l-primary-300/70 bg-primary-200/10 before:!text-white/70";

export function rehypePrettyCodeClasses() {
  return (tree: any) => {
    visit(
      tree,
      (node: any) =>
        Boolean(
          node.tagName === "code" &&
            Object.keys(node.properties).length === 0 &&
            node.children.some((n: any) => n.type === "text")
        ),
      (node: any) => {
        const textNode = node.children.find((n: any) => n.type === "text");
        textNode.type = "element";
        textNode.tagName = "code";
        textNode.properties = { className: [INLINE_CODE] };
        textNode.children = [{ type: "text", value: textNode.value }];
        node.properties.className = [INLINE_BLOCK];
        node.tagName = "span";
      }
    );

    visit(
      tree,
      (node: any) =>
        Boolean(
          typeof node?.properties?.["data-rehype-pretty-code-fragment"] !==
            "undefined"
        ),
      (node: any) => {
        if (node.tagName === "span") {
          node.properties.className = [
            ...(node.properties.className || []),
            INLINE_BLOCK
          ];
          node.children[0].properties.className = [
            ...(node.children[0].properties.className || []),
            INLINE_CODE
          ];

          return node;
        }

        if (node.tagName === "div") {
          node.properties.className = [
            ...(node.properties.className || []),
            BLOCK
          ];
          node.children = node.children.map((node: any) => {
            if (
              node.tagName === "div" &&
              typeof node.properties?.["data-rehype-pretty-code-title"] !==
                "undefined"
            ) {
              node.properties.className = [
                ...(node.properties.className || []),
                TITLE
              ];
            }
            if (node.tagName === "pre") {
              node.properties.className = [PRE];
              if (node.children[0].tagName === "code") {
                node.children[0].properties.className = [
                  ...(node.children[0].properties.className || []),
                  CODE
                ];
                if (
                  typeof node.children[0].properties["data-line-numbers"] !==
                  "undefined"
                ) {
                  node.children[0].properties.className.push(NUMBERED_LINES);
                }
              }
            }

            return node;
          });

          return node;
        }
      }
    );
  };
}

export const rehypePrettyCodeOptions: Partial<Options> = {
  // Use one of Shiki's packaged themes
  theme: "github-dark",
  tokensMap: {
    // VScode command palette: Inspect Editor Tokens and Scopes
    // https://github.com/Binaryify/OneDark-Pro/blob/47c66a2f2d3e5c85490e1aaad96f5fab3293b091/themes/OneDark-Pro.json
    fn: "entity.name.function",
    objKey: "meta.object-literal.key"
  },
  onVisitLine(node) {
    // Prevent lines from collapsing in `display: grid` mode, and
    // allow empty lines to be copy/pasted
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  // Feel free to add classNames that suit your docs
  onVisitHighlightedLine(node) {
    node.properties.className.push(HIGHLIGHTED_LINE);
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ["word"];
  }
};
