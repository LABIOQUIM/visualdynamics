import Link from "next/link";
import { usePathname } from "next/navigation";

import { cnMerge } from "@/utils/cnMerge";
import { routeIsActive } from "@/utils/route";

interface Props {
  link: NavigationItem;
}

export function SidebarLink({ link }: Props) {
  const pathname = usePathname();

  return (
    <li className="relative flex min-h-[2.5rem] items-center px-3">
      <Link
        href={link.href || "#"}
        className={cnMerge(
          "flex h-full w-full items-center font-medium transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200",
          {
            "text-gray-800 dark:text-gray-100": routeIsActive(pathname, link)
          }
        )}
        target={link.external ? "_blank" : "_self"}
      >
        {routeIsActive(pathname, link) && (
          <span
            className="absolute inset-y-0 left-0 h-full w-1 rounded-br-lg rounded-tr-lg bg-primary-600 dark:bg-primary-500"
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
          {link.label}
        </span>
      </Link>
    </li>
  );
}
