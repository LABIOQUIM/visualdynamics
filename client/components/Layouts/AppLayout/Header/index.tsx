import { LogIn, Moon, Sun, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import logo from "@/assets/logo.svg";
import { Button } from "@/components/Button";
import { HamburgerMenu } from "@/components/Layouts/AppLayout/Header/HamburgerMenu";
import { UserMenu } from "@/components/Layouts/AppLayout/Header/UserMenu";
import { useTheme } from "@/contexts/theme";
import { useI18n } from "@/locales/client";

export function Header() {
  const { status } = useSession();
  const { theme, toggleTheme } = useTheme();
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
        <ul className="flex flex-shrink-0 items-center gap-x-6">
          <li className="flex">
            <Button
              iconClassName="stroke-primary-600 group-hover:stroke-primary-400 dark:stroke-primary-300 dark:group-hover:stroke-primary-100"
              isOutline
              LeftIcon={theme === "light" ? Moon : Sun}
              onClick={toggleTheme}
            />
          </li>
          {status === "authenticated" ? (
            <>
              <li className="relative">
                <UserMenu />
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login">
                  <Button
                    LeftIcon={LogIn}
                    isOutline
                  >
                    {t("navigation.auth.login")}
                  </Button>
                </Link>
              </li>
              <li className="hidden lg:block">
                <Link href="/register">
                  <Button LeftIcon={UserPlus}>
                    {t("navigation.auth.register")}
                  </Button>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}
