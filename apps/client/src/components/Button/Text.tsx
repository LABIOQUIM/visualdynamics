import { ButtonHTMLAttributes, FC } from "react";
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
      className={`p-2 font-medium font-inter items-center justify-center text-primary-500 flex gap-x-1 disabled:opacity-60 enabled:hover:text-primary-600 transition-all duration-500 rounded-lg outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-900 ${className}`}
      {...rest}
    >
      {LeftIcon ? <LeftIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
      {children}
      {RightIcon ? <RightIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
    </button>
  );
};
