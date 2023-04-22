import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

export function UserMenu() {
  const { data: session, status } = useSession();
  const { t } = useTranslation(["navigation"]);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex gap-x-1 items-center hover:text-primary-500 dark:hover:text-primary-200 transition-all duration-150">
        <p>{session.user.username}</p>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="z-30 mr-2 border border-primary-400 bg-white dark:bg-gray-950 rounded-md p-2 will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
        sideOffset={5}
      >
        <DropdownMenu.Item
          className="group text-md gap-x-1 leading-none text-primary-600 dark:text-primary-400 rounded-md flex items-center p-2 relative select-none outline-none data-[highlighted]:cursor-pointer dark:data-[highlighted]:text-primary-300"
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
