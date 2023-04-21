import React, { FC } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { Theme, useTheme } from "@app/contexts/theme";

import { Icons } from "../Icons";

const bg = [
  "bg-amber-400",
  "bg-stone-400",
  "bg-green-400",
  "bg-indigo-400",
  "bg-violet-400",
  "bg-rose-400"
];

const hoverBg = [
  "hover:bg-amber-500",
  "hover:bg-stone-500",
  "hover:bg-green-500",
  "hover:bg-indigo-500",
  "hover:bg-violet-500",
  "hover:bg-rose-500"
];

export const SelectTheme: FC = () => {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="rounded-full w-7 h-7 my-auto border-2 border-white transition-all duration-500 bg-primary-400 outline-none hover:bg-primary-500"
          aria-label="Customise options"
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal className="z-20">
        <DropdownMenu.Content
          className="z-20 mr-2 md:mr-0 bg-green-950/60 p-2 rounded-md"
          sideOffset={5}
        >
          <DropdownMenu.RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as Theme)}
            className="flex gap-x-2"
          >
            {["amber", "stone", "green", "indigo", "violet", "rose"].map(
              (item, i) => (
                <DropdownMenu.RadioItem
                  key={item}
                  className="rounded-full flex items-center h-[25px] relative select-none outline-none data-[highlighted]:bg-primary-200/50"
                  value={item}
                >
                  <div
                    className={`rounded-full w-6 h-6 my-auto border-2 border-white ${bg[i]} ${hoverBg[i]} flex items-center justify-center`}
                  >
                    <DropdownMenu.ItemIndicator className="flex items-center justify-center">
                      <Icons.Check className="mt-0.5 stroke-zinc-100 stroke-[3] w-[75%] h-[75%]" />
                    </DropdownMenu.ItemIndicator>
                  </div>
                </DropdownMenu.RadioItem>
              )
            )}
          </DropdownMenu.RadioGroup>

          <DropdownMenu.Arrow className={`fill-green-950/60`} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
