import {
  ButtonHTMLAttributes,
  forwardRef,
  ForwardRefRenderFunction
} from "react";
import { LucideIcon } from "lucide-react";

import { cnMerge } from "@/utils/cnMerge";

type Variant = "primary" | "success" | "info" | "warning" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
  iconClassName?: string;
  isOutline?: boolean;
  noBorder?: boolean;
  variant?: Variant;
}

const BaseButton: ForwardRefRenderFunction<HTMLButtonElement, Props> = (
  {
    children,
    className,
    iconClassName,
    isOutline,
    LeftIcon,
    noBorder,
    RightIcon,
    variant = "primary",
    ...rest
  },
  ref
) => {
  return (
    <button
      className={cnMerge(
        `flex items-center justify-center gap-x-1 rounded-lg border p-2 font-medium text-white outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200  disabled:opacity-60 dark:focus:ring-offset-gray-900`,
        className,
        {
          "border-primary-600 bg-primary-600 focus:ring-primary-400 enabled:hover:bg-primary-700":
            variant === "primary",
          "border-green-600 bg-green-600 focus:ring-green-400 enabled:hover:bg-green-700":
            variant === "success",
          "border-cyan-600 bg-cyan-600 focus:ring-cyan-400 enabled:hover:bg-cyan-700":
            variant === "info",
          "border-amber-600 bg-amber-600 focus:ring-amber-400 enabled:hover:bg-amber-700":
            variant === "warning",
          "border-red-600 bg-red-600 focus:ring-red-400 enabled:hover:bg-red-700":
            variant === "danger",
          "text-primary-600 enabled:hover:text-primary-700":
            variant === "primary" && isOutline,
          "text-green-600 enabled:hover:text-green-700":
            variant === "success" && isOutline,
          "text-cyan-600 enabled:hover:text-cyan-700":
            variant === "info" && isOutline,
          "text-amber-600 enabled:hover:text-amber-700":
            variant === "warning" && isOutline,
          "text-red-600 enabled:hover:text-red-700":
            variant === "danger" && isOutline,
          "bg-transparent enabled:hover:bg-transparent": isOutline,
          "border-0": noBorder
        }
      )}
      ref={ref}
      {...rest}
    >
      {LeftIcon ? <LeftIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
      {children}
      {RightIcon ? <RightIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
    </button>
  );
};

export const Button = forwardRef(BaseButton);
