"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogIn, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/Button";
import { useI18n } from "@/locales/client";

export function UserMenu() {
  const { data: session, status } = useSession();
  const t = useI18n();

  if (status !== "authenticated") {
    return (
      <>
        <li>
          <Link href="/login">
            <Button
              LeftIcon={LogIn}
              isOutline
              noBorder
            >
              {t("navigation.auth.login")}
            </Button>
          </Link>
        </li>
        <li className="hidden lg:block">
          <Link href="/register">
            <Button LeftIcon={UserPlus}>{t("navigation.auth.register")}</Button>
          </Link>
        </li>
      </>
    );
  }

  return (
    <li className="relative">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="group flex items-center justify-center gap-x-1 rounded-lg p-2 font-medium text-primary-600 outline-none transition-all duration-150 hover:text-primary-400 focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-200 dark:text-primary-300 dark:hover:text-primary-400 dark:focus:ring-offset-gray-900">
          {session.user.username}
          <ChevronDown className="mt-1 h-4 w-4 stroke-primary-600 group-hover:stroke-primary-400 dark:stroke-primary-300 dark:group-hover:stroke-primary-400" />
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          className="data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-30 mr-2 rounded-md border border-primary-400 bg-white p-2 will-change-[opacity,transform] dark:bg-zinc-950"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="text-md group relative flex select-none items-center gap-x-1 rounded-md p-2 leading-none text-primary-600 outline-none data-[highlighted]:cursor-pointer dark:text-primary-400 dark:data-[highlighted]:text-primary-300"
            onClick={() => signOut({ redirect: false })}
          >
            <LogOut className="h-4 w-4" />
            {t("navigation.auth.logout")}
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="fill-primary-400" />
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </li>
  );
}
