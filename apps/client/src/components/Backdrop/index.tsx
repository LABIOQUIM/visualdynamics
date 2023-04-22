import React, { forwardRef } from "react";
import clsx from "clsx";

export type BackdropProps = React.HTMLAttributes<HTMLDivElement>;

export const Backdrop = forwardRef<HTMLDivElement, BackdropProps>(
  ({ className, ...other }, ref) => {
    return (
      <div
        className={clsx(
          "fixed inset-0 z-40 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center",
          className
        )}
        ref={ref}
        {...other}
      />
    );
  }
);
