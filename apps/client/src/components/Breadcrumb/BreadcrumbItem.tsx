import { LiHTMLAttributes } from "react";
import Link from "next/link";

export function BreadcrumbItem({
  children,
  href,
  ...props
}: LiHTMLAttributes<HTMLLIElement> & {
  href: string;
}) {
  return (
    <li {...props}>
      <Link
        className="lowercase text-primary-600 transition-all duration-500 font-medium hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
        href={href}
        passHref
      >
        {children}
      </Link>
    </li>
  );
}
