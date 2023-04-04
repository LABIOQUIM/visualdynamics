import { forwardRef, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, name, placeholder, type, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-y-0.5">
        <div className="flex justify-between">
          <label htmlFor={name}>{label}</label>
          {error ? (
            <p className="font-grotesk text-red-600 text-sm mt-auto">
              {error.message}
            </p>
          ) : null}
        </div>
        <input
          className={clsx(
            `border border-primary-200/25 px-2 py-1 h-10 outline-none rounded-md bg-zinc-100 placeholder:text-zinc-400 file:bg-primary-500 file:text-zinc-50 file:mr-2 file:transition-all file:py-1 file:px-2 file:h-full file:-ml-1 file:rounded-md file:border-0 file:text-sm file:font-semibold hover:file:bg-primary-600 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-zinc-200 ${className}`,
            {
              "border-red-600 focus:ring-red-500": error
            }
          )}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "0.1" : undefined}
          placeholder={type === "number" ? "0" : placeholder}
          autoComplete={type === "number" ? "off" : "auto"}
          onKeyDown={
            type === "number"
              ? (event) => {
                  if (
                    ![
                      "Backspace",
                      "Tab",
                      "ArrowUp",
                      "ArrowDown",
                      "ArrowLeft",
                      "ArrowRight"
                    ].includes(event.key) &&
                    !event.key.match(/^\d*\.?\d*$/)
                  ) {
                    event.preventDefault();
                  }
                }
              : undefined
          }
          id={name}
          name={name}
          ref={ref}
          type={type}
          {...props}
        />
      </div>
    );
  }
);
