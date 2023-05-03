import { ButtonHTMLAttributes, FC } from "react";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
  iconClassName?: string;
}

export const TextButton: FC<ButtonProps> = ({
  children,
  className,
  LeftIcon,
  RightIcon,
  iconClassName,
  ...rest
}) => {
  return (
    <button
      className={clsx(
        `group flex items-center justify-center gap-x-1 rounded-lg p-2 font-medium text-primary-600 outline-none transition-all duration-150 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-200 enabled:hover:text-primary-700 disabled:opacity-60 dark:focus:ring-offset-gray-900`,
        className
      )}
      {...rest}
    >
      {LeftIcon ? <LeftIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
      {children}
      {RightIcon ? <RightIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
    </button>
  );
};
