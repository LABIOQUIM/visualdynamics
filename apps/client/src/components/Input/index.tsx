import { forwardRef, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import clsx from "clsx";
import { useTranslation } from "next-i18next";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, label, name, placeholder, type, ...props }, ref) => {
    const { t } = useTranslation(["features"]);

    return (
      <div className="flex flex-col gap-y-0.5 w-full">
        {label || error ? (
          <div className="flex gap-x-2.5">
            {label ? <label htmlFor={name}>{label}</label> : null}
            {error ? (
              <p className="font-grotesk text-red-600 text-sm my-auto">
                {t(error.message ?? "")}
              </p>
            ) : null}
          </div>
        ) : null}
        <input
          className={clsx(
            `border border-primary-400/60 transition-all duration-150 px-2 py-1 h-10 outline-none rounded-lg bg-gray-50 dark:bg-gray-900 placeholder:text-zinc-400 file:bg-primary-500 file:text-gray-50 file:mr-2 file:py-1 file:px-2 file:h-full file:-ml-1 file:rounded-md file:border-0 file:text-sm file:font-semibold hover:file:bg-primary-600 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-200 dark:focus:ring-offset-gray-900 ${className}`,
            {
              "border-red-600/95 focus:ring-red-500": error
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
