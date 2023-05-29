import Link from "next/link";
import { usePathname } from "next/navigation";
import useTranslation from "next-translate/useTranslation";

import { cnMerge } from "@app/utils/cnMerge";
import { routeIsActive } from "@app/utils/route";

interface SidebarItemProps {
  link: NavigationItem;
}

export function SidebarItem({ link }: SidebarItemProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <li className="relative h-10 px-3">
      <Link
        href={link.href || "#"}
        className={`flex h-full w-full items-center font-medium transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 ${
          routeIsActive(pathname, link)
            ? "text-gray-800 dark:text-gray-100"
            : ""
        }`}
      >
        {routeIsActive(pathname, link) && (
          <span
            className="absolute inset-y-0 left-0 w-1 rounded-br-lg rounded-tr-lg bg-primary-600 dark:bg-primary-500"
            aria-hidden="true"
          />
        )}
        {link.Icon ? (
          <link.Icon
            className="h-4 w-4"
            aria-hidden="true"
          />
        ) : null}
        <span
          className={cnMerge({
            "ml-[1.625rem]": !link.Icon,
            "ml-2": !!link.Icon
          })}
        >
          {t(link.label)}
        </span>
      </Link>
    </li>
  );
}
