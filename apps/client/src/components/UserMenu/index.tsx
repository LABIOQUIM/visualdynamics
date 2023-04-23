import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { TextButton } from "@app/components/Button/Text";

export function UserMenu() {
  const { data: session, status } = useSession();
  const { t } = useTranslation(["navigation"]);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <TextButton
          className="text-primary-600 enabled:hover:text-primary-400 dark:text-primary-300 enabled:dark:hover:text-primary-400"
          iconClassName="stroke-primary-600 group-hover:stroke-primary-400 dark:stroke-primary-300 dark:group-hover:stroke-primary-400"
          RightIcon={ChevronDown}
        >
          {session.user.username}
        </TextButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-30 mr-2 rounded-md border border-primary-400 bg-white p-2 will-change-[opacity,transform] dark:bg-gray-950"
        sideOffset={5}
      >
        <DropdownMenu.Item
          className="text-md group relative flex select-none items-center gap-x-1 rounded-md p-2 leading-none text-primary-600 outline-none data-[highlighted]:cursor-pointer dark:text-primary-400 dark:data-[highlighted]:text-primary-300"
          onClick={() => signOut({ redirect: false })}
        >
          <LogOut className="h-4 w-4" />
          {t("navigation:auth.sign-out")}
        </DropdownMenu.Item>

        <DropdownMenu.Arrow className="fill-primary-400" />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
