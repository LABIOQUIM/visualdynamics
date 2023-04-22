import { ButtonHTMLAttributes, FC } from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
  iconClassName?: string;
}

export const Button: FC<ButtonProps> = ({
  children,
  className,
  iconClassName,
  LeftIcon,
  RightIcon,
  ...rest
}) => {
  return (
    <button
      className={`p-2 font-bold text-white font-inter items-center justify-center bg-primary-500 flex gap-x-1 disabled:opacity-60 enabled:hover:bg-primary-600 transition-all duration-500 rounded-md outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-zinc-200 ${className}`}
      {...rest}
    >
      {LeftIcon ? <LeftIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
      {children}
      {RightIcon ? <RightIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
    </button>
  );
};
