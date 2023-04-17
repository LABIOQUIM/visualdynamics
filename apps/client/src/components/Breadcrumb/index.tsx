import { Children, Fragment, ReactNode } from "react";

export function Breadcrumb({ children }: { children: ReactNode }) {
  const childrenArray = Children.toArray(children);

  const childrenWtihSeperator = childrenArray.map((child, index) => {
    if (index !== childrenArray.length - 1) {
      return (
        <Fragment key={index}>
          {child}
          <span>/</span>
        </Fragment>
      );
    }
    return child;
  });

  return (
    <nav className="my-2.5">
      <ol className="flex items-center space-x-2">{childrenWtihSeperator}</ol>
    </nav>
  );
}
