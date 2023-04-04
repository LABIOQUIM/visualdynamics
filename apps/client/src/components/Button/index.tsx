import { ButtonHTMLAttributes, FC } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<ButtonProps> = ({ children, className, ...rest }) => {
  return (
    <button
      className={`p-2 font-bold text-white font-inter items-center justify-center bg-primary-500 w-full flex hover:bg-primary-600 transition-all rounded-md outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-zinc-200 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
