import { FC } from "react";
import * as RSwitch from "@radix-ui/react-switch";
import clsx from "clsx";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  name: string;
  disabled?: boolean;
}

export const Switch: FC<SwitchProps> = ({
  label,
  onCheckedChange,
  checked,
  disabled,
  name
}) => {
  return (
    <div
      className={clsx("flex gap-x-2 items-center", {
        "opacity-60": disabled
      })}
    >
      <RSwitch.Root
        className="w-14 h-7 bg-primary-950 rounded-full relative data-[state=checked]:bg-primary-500 outline-none transition-all duration-500"
        id={name}
        disabled={disabled}
        name={name}
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <RSwitch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform duration-500 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[1.875rem]" />
      </RSwitch.Root>
      <label
        className="text-sm"
        htmlFor={name}
      >
        {label}
      </label>
    </div>
  );
};
