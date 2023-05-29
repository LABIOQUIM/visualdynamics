import React from "react";
import { motion, MotionProps } from "framer-motion";

import { cnMerge } from "@app/utils/cnMerge";

export type BackdropProps = React.HTMLAttributes<HTMLDivElement>;

export function Backdrop({ className, ...other }: BackdropProps & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={cnMerge(
        "fixed inset-0 z-40 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center",
        className
      )}
      {...other}
    />
  );
}
