import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

import { routeIsActive } from "@app/utils/route";

import { Transition } from "../Transition";

interface ISidebarSubmenu {
  item: NavigationItem;
  linkClicked: () => void;
}

export function SidebarSubmenu({ item, linkClicked }: ISidebarSubmenu) {
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
      className="relative px-3 h-10"
      key={item.label}
    >
      {isDropdownMenuOpen && (
        <span
          className="absolute h-full inset-y-0 left-0 w-1 bg-primary-600 rounded-tr-lg rounded-br-lg"
          aria-hidden="true"
        />
      )}
      <button
        className={`inline-flex items-center h-full justify-between w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
          isDropdownMenuOpen ? "dark:text-gray-100 text-gray-800" : ""
        }`}
        onClick={handleDropdownMenuClick}
        aria-haspopup="true"
      >
        <span className="inline-flex items-center">
          {item.Icon ? (
            <item.Icon
              className="w-5 h-5"
              aria-hidden="true"
            />
          ) : null}
          <span className="ml-4">{item.label}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 ${
            isDropdownMenuOpen ? `transform rotate-180` : ``
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
          className="p-2 mt-2 space-y-2 overflow-hidden text-sm font-medium text-gray-500 rounded-md shadow-inner bg-gray-50 dark:text-gray-400 dark:bg-gray-900"
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
                  className={`w-full inline-block ${
                    routeIsActive(pathname, r)
                      ? "dark:text-gray-100 text-gray-800"
                      : ""
                  }`}
                  onClick={linkClicked}
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
