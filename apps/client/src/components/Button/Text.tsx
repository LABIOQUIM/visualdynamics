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
      className={`p-2 font-bold font-inter items-center justify-center text-primary-500 flex gap-x-2 disabled:opacity-60 enabled:hover:text-primary-600 transition-all duration-500 rounded-md outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-zinc-200 ${className}`}
      {...rest}
    >
      {LeftIcon ? <LeftIcon className={iconClassName} /> : null}
      {children}
      {RightIcon ? <RightIcon className={iconClassName} /> : null}
    </button>
  );
};
