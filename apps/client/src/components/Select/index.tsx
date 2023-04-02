import React from "react";
import * as RSelect from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

type SelectProps<T extends string | number | symbol> = {
  values: {
    [key in T]: string;
  };
  onChange: (value: T) => void;
  selectedValue: T;
  label: string;
  placeholder: string;
};

export const Select = <T extends string>({
  values,
  onChange,
  selectedValue,
  label,
  placeholder
}: SelectProps<T>) => {
  return (
    <div className="flex flex-col gap-y-1">
      <label>{label}</label>
      <RSelect.Root
        onValueChange={onChange}
        value={selectedValue}
      >
        <RSelect.Trigger className="flex justify-between items-center rounded-lg border border-primary-900/25 placeholder:text-zinc-600 bg-zinc-900 px-2 py-1 h-10 outline-none">
          <RSelect.Value
            className="text-zinc-600"
            placeholder={placeholder}
          />
          <RSelect.Icon>
            <ChevronDown />
          </RSelect.Icon>
        </RSelect.Trigger>
        <RSelect.Content
          className="p-2 mt-1 ml-auto bg-zinc-950 border border-primary-400/25 rounded-lg"
          position="popper"
        >
          <RSelect.ScrollUpButton className="flex items-center justify-center h-7 bg-transparent text-primary-500 cursor-default">
            <ChevronUp />
          </RSelect.ScrollUpButton>
          <RSelect.Viewport>
            <RSelect.Group>
              <RSelect.Label className="text-sm text-zinc-400 mb-2">
                {label}
              </RSelect.Label>

              {Object.keys(values).map((item) => (
                <RSelect.Item
                  key={item}
                  value={item}
                  className={`text-sm text-zinc-100 rounded flex items-center h-7 pl-8 pr-2 relative select-none data-[highlighted]:outline-none data-[highlighted]:bg-primary-200/30 data-[highlighted]:text-zinc-50`}
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
        </RSelect.Content>
      </RSelect.Root>
    </div>
  );
};
