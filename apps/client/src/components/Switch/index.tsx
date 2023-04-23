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
      className={clsx("flex items-center gap-x-2", {
        "opacity-60": disabled
      })}
    >
      <RSwitch.Root
        className="relative h-7 w-14 rounded-full bg-primary-950 outline-none transition-all duration-500 data-[state=checked]:bg-primary-500"
        id={name}
        disabled={disabled}
        name={name}
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <RSwitch.Thumb className="block h-6 w-6 translate-x-0.5 rounded-full bg-white transition-transform duration-500 will-change-transform data-[state=checked]:translate-x-[1.875rem]" />
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
