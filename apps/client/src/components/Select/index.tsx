import React from "react";
import { FieldError } from "react-hook-form";
import * as RSelect from "@radix-ui/react-select";
import clsx from "clsx";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "next-i18next";

type SelectProps<T extends string | number | symbol> = {
  error?: FieldError;
  label: string;
  name: string;
  onChange: (value: T) => void;
  placeholder: string;
  selectedValue: T;
  values: {
    [key in T]: string;
  };
};

export const Select = <T extends string>({
  error,
  label,
  name,
  onChange,
  placeholder,
  selectedValue,
  values
}: SelectProps<T>) => {
  const { t } = useTranslation(["features"]);

  return (
    <div className="flex flex-col gap-y-0.5 w-full">
      <div className="flex gap-x-2.5">
        <label htmlFor={name}>{label}</label>
        {error ? (
          <p className="font-grotesk text-red-600 text-sm mt-auto">
            {t(error.message ?? "")}
          </p>
        ) : null}
      </div>
      <RSelect.Root
        onValueChange={onChange}
        value={selectedValue}
      >
        <RSelect.Trigger
          className={clsx(
            "flex justify-between transition-all duration-500 items-center rounded-md border border-primary-400/60 data-[placeholder]:text-zinc-400 bg-zinc-100 px-2 py-1 h-10 outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-zinc-200",
            {
              "border-red-600/95 focus:ring-red-500": error
            }
          )}
          id={name}
          name={name}
        >
          <RSelect.Value
            className="text-zinc-600"
            placeholder={placeholder}
          />
          <RSelect.Icon>
            <ChevronDown />
          </RSelect.Icon>
        </RSelect.Trigger>
        <RSelect.Content
          className="p-2 z-10 w-[--radix-select-trigger-width] max-h-[16rem] bg-zinc-100 border border-primary-400/60 transition-all duration-500 rounded-md"
          position="popper"
        >
          <RSelect.ScrollUpButton className="flex items-center justify-center h-7 bg-transparent text-primary-500 cursor-default">
            <ChevronUp />
          </RSelect.ScrollUpButton>
          <RSelect.Viewport>
            <RSelect.Group>
              <RSelect.Label className="text-sm text-zinc-600 mb-2">
                {label}
              </RSelect.Label>
              {Object.keys(values).map((item) => (
                <RSelect.Item
                  key={item}
                  value={item}
                  className={`text-sm text-zinc-900 rounded flex items-center min-h-[1.75rem] pl-8 pr-2 relative select-none data-[highlighted]:outline-none data-[highlighted]:bg-primary-200/30 data-[highlighted]:text-zinc-800`}
                >
                  <RSelect.ItemIndicator className="absolute left-1 w-7 items-center justify-center">
                    <Check />
                  </RSelect.ItemIndicator>
                  <RSelect.ItemText>
                    {values[item as keyof typeof values]}
                  </RSelect.ItemText>
                </RSelect.Item>
              ))}
            </RSelect.Group>
          </RSelect.Viewport>
          <RSelect.ScrollDownButton className="flex items-center justify-center h-7 bg-transparent text-primary-500 cursor-default">
            <ChevronDown />
          </RSelect.ScrollDownButton>
          <RSelect.Arrow className="fill-primary-400/60 h-2 w-3" />
        </RSelect.Content>
      </RSelect.Root>
    </div>
  );
};
