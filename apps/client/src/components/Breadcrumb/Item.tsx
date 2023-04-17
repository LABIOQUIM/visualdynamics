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
        className="uppercase text-primary-600 font-grotesk transition-all duration-500 font-medium hover:text-primary-800"
        href={href}
        passHref
      >
        {children}
      </Link>
    </li>
  );
}
