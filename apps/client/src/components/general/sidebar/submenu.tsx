import { useState } from "react";
import { AnimatePresence, LazyMotion, m } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useTranslation from "next-translate/useTranslation";

import { cnMerge } from "@app/utils/cnMerge";
import { routeIsActive } from "@app/utils/route";

interface ISidebarSubmenu {
  item: NavigationItem;
}

export function SidebarSubmenu({ item }: ISidebarSubmenu) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(
    item.links
      ? item.links.filter((r) => {
          return routeIsActive(pathname, r);
        }).length > 0
      : false
  );

  function handleDropdownMenuClick() {
    setIsDropdownMenuOpen((oldValue) => !oldValue);
  }

  return (
    <li
      className="relative min-h-[2.5rem] px-3"
      key={item.label}
    >
      {item.links?.some((r) => routeIsActive(pathname, r)) ? (
        <span
          className="absolute inset-y-0 left-0 h-10 w-1 rounded-br-lg rounded-tr-lg bg-primary-600 dark:bg-primary-500"
          aria-hidden="true"
        />
      ) : null}
      <button
        className={`flex h-10 w-full items-center justify-between font-medium transition-colors duration-150 hover:text-gray-800 focus:outline-none dark:hover:text-gray-200 ${
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
              className="h-4 w-4"
              aria-hidden="true"
            />
          ) : null}
          <span
            className={cnMerge({
              "ml-[1.625rem]": !item.Icon,
              "ml-2": !!item.Icon
            })}
          >
            {t(item.label)}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isDropdownMenuOpen ? `rotate-180 transform` : ``
          }`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence mode="wait">
        {isDropdownMenuOpen ? (
          <LazyMotion
            features={() =>
              import("@app/utils/load-motion-features").then(
                (res) => res.default
              )
            }
          >
            <m.ul
              key={item.label}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-0.5 overflow-hidden pl-10 pr-5 font-medium text-gray-500 dark:text-gray-400"
              aria-label="submenu"
            >
              {item.links &&
                item.links.map((r) => (
                  <li
                    className="py-2 transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
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
            </m.ul>
          </LazyMotion>
        ) : null}
      </AnimatePresence>
    </li>
  );
}
