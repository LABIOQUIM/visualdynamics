import React from "react";
import { FieldError } from "react-hook-form";
import * as RSelect from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import useTranslation from "next-translate/useTranslation";

import { cnMerge } from "@app/utils/cnMerge";

type SelectProps<T extends string | number | symbol> = {
  error?: FieldError;
  label: string;
  name: string;
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder: string;
  selectedValue: T;
  values: {
    [key in T]: string;
  };
};

export const Select = <T extends string>({
  disabled,
  error,
  label,
  name,
  onChange,
  placeholder,
  selectedValue,
  values
}: SelectProps<T>) => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-y-0.5">
      <div className="flex gap-x-2.5">
        <label htmlFor={name}>{label}</label>
        {error ? (
          <p className="mt-auto  text-sm text-red-600">
            {t(error.message ?? "")}
          </p>
        ) : null}
      </div>
      <RSelect.Root
        onValueChange={onChange}
        value={selectedValue}
        disabled={disabled}
      >
        <RSelect.Trigger
          className={cnMerge(
            "flex h-10 items-center justify-between rounded-lg border border-primary-400/60 bg-zinc-50 px-2 py-1 outline-none transition-all duration-150 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-zinc-200 data-[placeholder]:text-zinc-400 dark:bg-zinc-900 dark:focus:ring-offset-gray-900",
            {
              "border-red-600/95 focus:ring-red-500": error,
              "opacity-50": disabled
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
          className="z-40 max-h-[16rem] w-[--radix-select-trigger-width] rounded-md border border-primary-400/60 bg-zinc-50 p-2 transition-all duration-150 dark:bg-zinc-900"
          position="popper"
          sideOffset={5}
        >
          <RSelect.ScrollUpButton className="flex h-7 cursor-default items-center justify-center bg-transparent text-primary-500">
            <ChevronUp />
          </RSelect.ScrollUpButton>
          <RSelect.Viewport>
            <RSelect.Group>
              <RSelect.Label className="mb-2 text-sm text-gray-600 dark:text-gray-100">
                {label}
              </RSelect.Label>
              {Object.keys(values).map((item) => (
                <RSelect.Item
                  key={item}
                  value={item}
                  className={`relative flex min-h-[1.75rem] select-none items-center rounded pl-8 pr-2 text-sm text-gray-900 data-[highlighted]:bg-primary-200/60 data-[highlighted]:text-gray-800 data-[highlighted]:outline-none dark:text-gray-300 dark:data-[highlighted]:text-gray-900`}
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
          <RSelect.ScrollDownButton className="flex h-7 cursor-default items-center justify-center bg-transparent text-primary-500">
            <ChevronDown />
          </RSelect.ScrollDownButton>
          <RSelect.Arrow className="h-2 w-3 fill-primary-400/60" />
        </RSelect.Content>
      </RSelect.Root>
    </div>
  );
};
