import { forwardRef, InputHTMLAttributes } from "react";
import * as Label from "@radix-ui/react-label";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, name, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-y-0.5">
        <Label.Root htmlFor={name}>{label}</Label.Root>
        <input
          className={`border border-primary-900/25 px-2 py-1 h-10 outline-none rounded-lg bg-zinc-900 file:bg-primary-500 file:text-white file:mr-2 file:transition-all file:py-1 file:px-2 file:h-full file:-ml-1 file:rounded-md file:border-0 file:text-sm file:font-semibold hover:file:bg-primary-600 focus:border-primary-900/25 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary-600/40 ${className}`}
          id={name}
          name={name}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
