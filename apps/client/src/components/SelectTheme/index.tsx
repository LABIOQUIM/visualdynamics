import React, { FC } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { Icons } from "../Icons";

interface SelectThemeProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const bg = ["bg-emerald-400", "bg-sky-400", "bg-violet-400", "bg-rose-400"];

const hoverBg = [
  "hover:bg-emerald-500",
  "hover:bg-sky-500",
  "hover:bg-violet-500",
  "hover:bg-rose-500"
];

export const SelectTheme: FC<SelectThemeProps> = ({ setTheme, theme }) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button
        className="rounded-full w-7 h-7 my-auto border-2 border-white transition-all bg-primary-400 outline-none hover:bg-primary-500 hover:border-zinc-200"
        aria-label="Customise options"
      />
    </DropdownMenu.Trigger>

    <DropdownMenu.Content
      className="bg-primary-950/60 p-2 rounded-md"
      sideOffset={5}
    >
      <DropdownMenu.RadioGroup
        value={theme}
        onValueChange={setTheme}
        className="flex gap-x-2"
      >
        {["brand", "sky", "violet", "rose"].map((item, i) => (
          <DropdownMenu.RadioItem
            key={item}
            className="rounded-full flex items-center h-[25px] relative select-none outline-none data-[highlighted]:bg-primary-200/50"
            value={item}
          >
            <div
              className={`rounded-full w-6 h-6 my-auto border-2 border-white transition-all ${bg[i]} ${hoverBg[i]} flex items-center justify-center hover:border-zinc-200`}
            >
              <DropdownMenu.ItemIndicator className="flex items-center justify-center">
                <Icons.Check className="mt-0.5 stroke-primary-100 stroke-[3] w-[75%] h-[75%]" />
              </DropdownMenu.ItemIndicator>
            </div>
          </DropdownMenu.RadioItem>
        ))}
      </DropdownMenu.RadioGroup>

      <DropdownMenu.Arrow className="fill-primary-950/60" />
    </DropdownMenu.Content>
  </DropdownMenu.Root>
);
