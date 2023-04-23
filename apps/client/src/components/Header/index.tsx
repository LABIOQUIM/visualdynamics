import { useContext, useState } from "react";
import { Bell, LogIn, Menu, Moon, Search, Sun, UserPlus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { Button } from "@app/components/Button";
import { TextButton } from "@app/components/Button/Text";
import { Input } from "@app/components/Input";
import { UserMenu } from "@app/components/UserMenu";
import { SidebarContext } from "@app/context/SidebarContext";
import { useTheme } from "@app/context/ThemeContext";

export function Header() {
  const { status } = useSession();
  const { toggleSidebar } = useContext(SidebarContext);
  const { theme, toggleTheme } = useTheme();
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);

  function handleNotificationsClick() {
    setIsNotificationsMenuOpen(!isNotificationsMenuOpen);
  }

  return (
    <header className="shadow-bottom sticky top-0 z-40 bg-white py-4 transition-all duration-150 dark:bg-gray-900 lg:relative lg:top-auto">
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
        {/* <!-- Search input --> */}
        <div className="mx-auto hidden w-1/2 justify-center lg:flex">
          <div className="relative flex-1 focus-within:text-primary-500 dark:focus-within:text-primary-100">
            <div className="absolute inset-y-0 flex items-center pl-2">
              <Search
                className="h-4 w-4"
                aria-hidden="true"
              />
            </div>
            <Input
              className="w-full pl-8 dark:bg-gray-950"
              placeholder="Search for projects"
              aria-label="Search"
            />
          </div>
        </div>
        <ul className="flex flex-shrink-0 items-center gap-x-6">
          {/* <!-- Theme toggler --> */}
          <li className="flex">
            <TextButton
              iconClassName="stroke-primary-600 group-hover:stroke-primary-400 dark:stroke-primary-300 dark:group-hover:stroke-primary-400"
              LeftIcon={theme === "light" ? Moon : Sun}
              onClick={toggleTheme}
            />
          </li>
          {status === "authenticated" ? (
            <>
              {/* <!-- Notifications menu --> */}
              <li className="flex">
                <button
                  className="focus:shadow-outline-purple relative rounded-md align-middle focus:outline-none"
                  onClick={handleNotificationsClick}
                  aria-label="Notifications"
                  aria-haspopup="true"
                >
                  <Bell
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                  {/* <!-- Notification badge --> */}
                  <span
                    aria-hidden="true"
                    className="absolute right-0 top-0 inline-block h-3 w-3 -translate-y-1 translate-x-1 transform rounded-full border-2 border-white bg-red-600 dark:border-gray-800"
                  />
                </button>
              </li>
              {/* <!-- Profile menu --> */}
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
                <Link href="/register">
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
