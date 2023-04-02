/* eslint-disable react/no-array-index-key */
import React from "react";
import clsx from "clsx";

// There are probably better ways to do this 🥴
export function Code({ children }: { children: React.ReactNode }) {
  const [slide, setSlide] = React.useState(0);

  const titles: string[] = [];

  if (React.Children.count(children) === 0) {
    return null;
  }

  const slides = React.Children.map(children, (child, index) => {
    if (
      !React.isValidElement(child) ||
      typeof child.props?.["data-rehype-pretty-code-fragment"] === "undefined"
    ) {
      return null;
    }

    if (
      typeof child.props.children?.[0]?.props?.[
        "data-rehype-pretty-code-title"
      ] !== "undefined"
    ) {
      const title = child.props.children[0].props.children.split("/");
      titles.push(title[title.length - 1]);
    }

    return (
      <div
        key={index}
        className={clsx({
          block: index === slide,
          hidden: index !== slide
        })}
      >
        {child}
      </div>
    );
  });

  return (
    <>
      {/* <Aside> */}
      <div className="mb-2 text-sm font-medium">Select a file</div>
      <div className="flex flex-wrap">
        {titles.map((title, index) => (
          <button
            key={index}
            className={clsx(
              "mr-2 mb-2 rounded-lg px-2 py-1 text-sm font-medium",
              {
                "bg-primary-100/10 text-primary-100/70 hover:bg-primary-100/20 hover:text-primary-100":
                  index !== slide,
                "bg-primary-100/30 text-white": index === slide
              }
            )}
            onClick={() => setSlide(index)}
          >
            {title}
          </button>
        ))}
      </div>
      {/* </Aside> */}

      <div>{slides}</div>
    </>
  );
}
