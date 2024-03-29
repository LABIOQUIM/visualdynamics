"use client";
import { forwardRef, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

import { useI18n } from "@/locales/client";
import { cnMerge } from "@/utils/cnMerge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, label, name, placeholder, type, ...props }, ref) => {
    const t = useI18n();

    return (
      <div className="flex w-full flex-col gap-y-0.5">
        {label || error ? (
          <div className="flex gap-x-2.5">
            {label ? <label htmlFor={name}>{label}</label> : null}
            {error ? (
              <p className="my-auto text-sm text-red-600">
                {/* @ts-ignore */}
                {t(error.message ?? "")}
              </p>
            ) : null}
          </div>
        ) : null}
        <input
          className={cnMerge(
            `h-10 rounded-lg border border-primary-400/60 bg-zinc-50 px-2 py-1 outline-none transition-all duration-150 file:-ml-1 file:mr-2 file:h-full file:rounded-md file:border-0 file:bg-primary-500 file:px-2 file:py-1 file:text-sm file:font-semibold file:text-gray-50 placeholder:text-zinc-400 hover:file:bg-primary-600 focus:border-primary-400/70 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-200 disabled:opacity-60 dark:bg-zinc-900 dark:focus:ring-offset-gray-900 ${className}`,
            {
              "border-red-600/95 focus:ring-red-500": error
            }
          )}
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
