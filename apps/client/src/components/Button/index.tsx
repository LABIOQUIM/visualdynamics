import { ButtonHTMLAttributes, FC } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<ButtonProps> = ({ children, className, ...rest }) => {
  return (
    <button
      className={`p-2 items-center justify-center bg-primary-500 w-full flex hover:bg-primary-600 transition-all rounded-lg ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
