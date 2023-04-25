import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import { Transition } from "@app/components/Transition";
import { routeIsActive } from "@app/utils/route";

interface ISidebarSubmenu {
  item: NavigationItem;
}

export function SidebarSubmenu({ item }: ISidebarSubmenu) {
  const { pathname } = useRouter();

  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(
    item.links
      ? item.links.filter((r) => {
          return routeIsActive(pathname, r);
        }).length > 0
      : false
  );

  function handleDropdownMenuClick() {
    setIsDropdownMenuOpen(!isDropdownMenuOpen);
  }

  return (
    <li
      className="relative h-10 px-3"
      key={item.label}
    >
      {isDropdownMenuOpen && (
        <span
          className="absolute inset-y-0 left-0 h-full w-1 rounded-br-lg rounded-tr-lg bg-primary-600 dark:bg-primary-500"
          aria-hidden="true"
        />
      )}
      <button
        className={`inline-flex h-full w-full items-center justify-between text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
          isDropdownMenuOpen ? "text-gray-800 dark:text-gray-100" : ""
        }`}
        onClick={handleDropdownMenuClick}
        aria-haspopup="true"
      >
        <span className="inline-flex items-center">
          {item.Icon ? (
            <item.Icon
              className="h-5 w-5"
              aria-hidden="true"
            />
          ) : null}
          <span className="ml-4">{item.label}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 ${
            isDropdownMenuOpen ? `rotate-180 transform` : ``
          }`}
          aria-hidden="true"
        />
      </button>
      <Transition
        show={isDropdownMenuOpen}
        enter="transition-all ease-in-out duration-300"
        enterFrom="opacity-25 max-h-0"
        enterTo="opacity-100 max-h-xl"
        leave="transition-all ease-in-out duration-300"
        leaveFrom="opacity-100 max-h-xl"
        leaveTo="opacity-0 max-h-0"
      >
        <ul
          className="mt-2 space-y-2 overflow-hidden rounded-lg bg-gray-50 p-2 text-sm font-medium text-gray-500 shadow-inner dark:bg-gray-900 dark:text-gray-400"
          aria-label="submenu"
        >
          {item.links &&
            item.links.map((r) => (
              <li
                className="px-2 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                key={r.label}
              >
                <Link
                  href={r.href || ""}
                  scroll={false}
                  className={`inline-block w-full ${
                    routeIsActive(pathname, r)
                      ? "text-gray-800 dark:text-gray-100"
                      : ""
                  }`}
                >
                  {r.label}
                </Link>
              </li>
            ))}
        </ul>
      </Transition>
    </li>
  );
}
