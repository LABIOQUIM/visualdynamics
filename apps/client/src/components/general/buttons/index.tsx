import {
  ButtonHTMLAttributes,
  forwardRef,
  ForwardRefRenderFunction
} from "react";
import { LucideIcon } from "lucide-react";

import { cnMerge } from "@app/utils/cnMerge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
  iconClassName?: string;
}

const BaseButton: ForwardRefRenderFunction<HTMLButtonElement, ButtonProps> = (
  { children, className, iconClassName, LeftIcon, RightIcon, ...rest },
  ref
) => {
  return (
    <button
      className={cnMerge(
        `flex items-center justify-center gap-x-1 rounded-lg bg-primary-600 p-2 font-medium text-white outline-none transition-all duration-150 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-200 enabled:hover:bg-primary-700 disabled:opacity-60 dark:focus:ring-offset-gray-900`,
        className
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
