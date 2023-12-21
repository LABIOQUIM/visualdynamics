import { Construction, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.svg";
import { Button } from "@/components/Button";
import { HamburgerMenu } from "@/components/Layouts/AppLayout/Header/HamburgerMenu";
import { UserMenu } from "@/components/Layouts/AppLayout/Header/UserMenu";
import { useSettings } from "@/contexts/settings";
import { useTheme } from "@/contexts/theme";
import { useI18n } from "@/locales/client";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { maintenanceMode } = useSettings();
  const t = useI18n();

  return (
    <header className="sticky top-0 z-50 h-20 bg-white py-4 transition-all duration-150 dark:bg-zinc-900 lg:relative lg:top-auto">
      <div className="container mx-auto flex h-full items-center justify-between gap-x-4 px-6 text-primary-600 dark:text-primary-300">
        {/* <!-- Mobile hamburger --> */}
        <HamburgerMenu />
        <Link
          className="hidden h-[125%] w-auto gap-x-2 font-bold uppercase lg:flex"
          href="/"
        >
          <Image
            alt=""
            className="h-full w-auto"
            src={logo}
            priority
          />
        </Link>
        {maintenanceMode ? (
          <div className="flex w-full items-center justify-center gap-2 text-amber-600 underline-offset-4 hover:underline dark:text-amber-400">
            <Construction className="min-h-[1.75rem] min-w-[1.75rem]" />
            {t("common.maintenance")}
          </div>
        ) : null}
        <ul className="flex flex-shrink-0 items-center gap-x-4">
          <li className="flex">
            <Button
              isOutline
              noBorder
              LeftIcon={theme === "light" ? Moon : Sun}
              onClick={toggleTheme}
            />
          </li>
          <UserMenu />
        </ul>
      </div>
    </header>
  );
}
