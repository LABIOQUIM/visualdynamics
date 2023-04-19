import { ButtonHTMLAttributes, FC } from "react";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  LeftIcon?: LucideIcon;
  RightIcon?: LucideIcon;
  status: "queued" | "canceled" | "finished" | "running" | "error";
}

export const StatusButton: FC<ButtonProps> = ({
  children,
  className,
  LeftIcon,
  RightIcon,
  status,
  ...rest
}) => {
  return (
    <button
      className={clsx(
        `px-2 py-1 font-medium text-white font-inter items-center justify-center flex gap-x-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed duration-500 rounded-md outline-none focus:ring-2 focus:ring-offset-2 ${className}`,
        {
          "bg-cyan-600/80 enabled:hover:bg-cyan-700 focus:ring-cyan-400 focus:ring-offset-cyan-400/20":
            status === "running",
          "bg-zinc-600/80 enabled:hover:bg-zinc-700 focus:ring-zinc-400 focus:ring-offset-zinc-400/20":
            status === "canceled",
          "bg-yellow-600/80 enabled:hover:bg-yellow-700 focus:ring-yellow-400 focus:ring-offset-yellow-400/20":
            status === "queued",
          "bg-emerald-600/80 enabled:hover:bg-emerald-700 focus:ring-emerald-400 focus:ring-offset-emerald-400/20":
            status === "finished",
          "bg-red-600/80 enabled:hover:bg-red-700 focus:ring-red-400 focus:ring-offset-red-400/20":
            status === "error"
        }
      )}
      {...rest}
    >
      {LeftIcon ? <LeftIcon /> : null}
      {children}
      {RightIcon ? <RightIcon /> : null}
    </button>
  );
};
