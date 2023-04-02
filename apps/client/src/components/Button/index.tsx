import { ButtonHTMLAttributes, FC } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<ButtonProps> = ({ children, className, ...rest }) => {
  return (
    <button
      className={`${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
