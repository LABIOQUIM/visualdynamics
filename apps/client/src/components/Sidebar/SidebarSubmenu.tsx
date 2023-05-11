import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

import { routeIsActive } from "@app/utils/route";

interface ISidebarSubmenu {
  item: NavigationItem;
}

export function SidebarSubmenu({ item }: ISidebarSubmenu) {
  const { pathname } = useRouter();
  const { t } = useTranslation();

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
      className="min-h-10 relative px-3"
      key={item.label}
    >
      {isDropdownMenuOpen ||
      item.links?.some((r) => routeIsActive(pathname, r)) ? (
        <span
          className="absolute inset-y-0 left-0 h-10 w-1 rounded-br-lg rounded-tr-lg bg-primary-600 dark:bg-primary-500"
          aria-hidden="true"
        />
      ) : null}
      <button
        className={`flex h-10 w-full items-center justify-between text-sm font-semibold transition-colors duration-150 hover:text-gray-800 focus:outline-none dark:hover:text-gray-200 ${
          isDropdownMenuOpen ||
          item.links?.some((r) => routeIsActive(pathname, r))
            ? "text-gray-800 dark:text-gray-100"
            : ""
        }`}
        onClick={handleDropdownMenuClick}
        aria-haspopup="true"
      >
        <span className="flex items-center">
          {item.Icon ? (
            <item.Icon
              className="h-5 w-5"
              aria-hidden="true"
            />
          ) : null}
          <span className="ml-4">{t(item.label)}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 ${
            isDropdownMenuOpen ? `rotate-180 transform` : ``
          }`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence mode="wait">
        {isDropdownMenuOpen ? (
          <motion.ul
            key={item.label}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden rounded-lg bg-zinc-50 px-2 text-sm font-medium text-gray-500 shadow-inner dark:bg-zinc-900 dark:text-gray-400"
            aria-label="submenu"
          >
            {item.links &&
              item.links.map((r) => (
                <li
                  className="ml-2 px-5 py-1 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
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
                    {t(r.label)}
                  </Link>
                </li>
              ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </li>
  );
}
