"use client";

import {
  Combobox,
  Group,
  InputBase,
  useCombobox,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconMoonFilled,
  IconSunFilled,
  IconSunMoon,
} from "@tabler/icons-react";

const colorSchemes = ["light", "dark", "auto"] as const;

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options = colorSchemes.map((item) => (
    <Combobox.Option active={item === colorScheme} value={item} key={item}>
      <Group
        style={{
          textTransform: "capitalize",
        }}
        gap={8}
      >
        {item === "dark" && (
          <IconMoonFilled style={{ width: 16, height: 16 }} stroke={1.5} />
        )}
        {item === "light" && (
          <IconSunFilled style={{ width: 16, height: 16 }} stroke={1.5} />
        )}
        {item === "auto" && (
          <IconSunMoon style={{ width: 16, height: 16 }} stroke={1.5} />
        )}
        {item}
      </Group>
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        setColorScheme(val as "dark" | "light" | "auto");
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          pointer
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
        >
          <Group
            style={{
              textTransform: "capitalize",
            }}
            gap={8}
          >
            {colorScheme === "dark" && (
              <IconMoonFilled style={{ width: 16, height: 16 }} stroke={1.5} />
            )}
            {colorScheme === "light" && (
              <IconSunFilled style={{ width: 16, height: 16 }} stroke={1.5} />
            )}
            {colorScheme === "auto" && (
              <IconSunMoon style={{ width: 16, height: 16 }} stroke={1.5} />
            )}
            {colorScheme}
          </Group>
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{...options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
