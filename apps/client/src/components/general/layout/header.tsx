import { useContext } from "react";
import { Atom, LogIn, Menu, Moon, Sun, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { Button } from "@app/components/general/buttons";
import { TextButton } from "@app/components/general/buttons/Text";
import { SidebarContext } from "@app/context/SidebarContext";
import { useTheme } from "@app/context/ThemeContext";

const UserMenu = dynamic(
  () =>
    import("@app/components/general/layout/user-menu").then((m) => m.UserMenu),
  {
    ssr: false
  }
);

export function Header() {
  const { status } = useSession();
  const { toggleSidebar } = useContext(SidebarContext);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 h-20 bg-white py-4 transition-all duration-150 dark:bg-zinc-900 lg:relative lg:top-auto">
      <div className="container mx-auto flex h-full items-center justify-between gap-x-4 px-6 text-primary-600 dark:text-primary-300">
        {/* <!-- Mobile hamburger --> */}
        <button
          className="focus:shadow-outline-purple -ml-1 rounded-md p-1 focus:outline-none lg:hidden"
          onClick={toggleSidebar}
          aria-label="Menu"
        >
          <Menu
            className="h-6 w-6"
            aria-hidden="true"
          />
        </button>
        <Link
          className="hidden gap-x-2 font-bold uppercase lg:flex"
          href="/"
        >
          <Atom />
          Visual Dynamics
        </Link>
        <ul className="flex flex-shrink-0 items-center gap-x-6">
          <li className="flex">
            <TextButton
              iconClassName="stroke-primary-600 group-hover:stroke-primary-400 dark:stroke-primary-300 dark:group-hover:stroke-primary-400"
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
                <Link href="/signin">
                  <Button LeftIcon={LogIn}>Sign In</Button>
                </Link>
              </li>
              <li className="hidden lg:block">
                <Link href="/signup">
                  <TextButton LeftIcon={UserPlus}>Register</TextButton>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}
