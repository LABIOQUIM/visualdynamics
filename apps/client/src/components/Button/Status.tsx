import { ButtonHTMLAttributes, FC } from "react";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
  status: "queued" | "canceled" | "finished" | "running" | "error";
  iconClassName?: string;
}

export const StatusButton: FC<ButtonProps> = ({
  children,
  className,
  iconClassName,
  LeftIcon,
  RightIcon,
  status,
  ...rest
}) => {
  return (
    <button
      className={clsx(
        `group flex items-center justify-center gap-x-1 rounded-lg p-2 font-medium text-white outline-none transition-all duration-150 focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`,
        {
          "bg-cyan-600/80 focus:ring-cyan-400 focus:ring-offset-cyan-400/20 enabled:hover:bg-cyan-700 dark:enabled:hover:bg-cyan-500":
            status === "running",
          "bg-zinc-600/80 focus:ring-zinc-400 focus:ring-offset-zinc-400/20 enabled:hover:bg-zinc-700 dark:enabled:hover:bg-zinc-500":
            status === "canceled",
          "bg-yellow-600/80 focus:ring-yellow-400 focus:ring-offset-yellow-400/20 enabled:hover:bg-yellow-700 dark:enabled:hover:bg-yellow-500":
            status === "queued",
          "bg-emerald-600/80 focus:ring-emerald-400 focus:ring-offset-emerald-400/20 enabled:hover:bg-emerald-700 dark:enabled:hover:bg-emerald-500":
            status === "finished",
          "bg-red-600/80 focus:ring-red-400 focus:ring-offset-red-400/20 enabled:hover:bg-red-700 dark:enabled:hover:bg-red-500":
            status === "error"
        }
      )}
      {...rest}
    >
      {LeftIcon ? <LeftIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
      {children}
      {RightIcon ? <RightIcon className={`h-4 w-4 ${iconClassName}`} /> : null}
    </button>
  );
};
