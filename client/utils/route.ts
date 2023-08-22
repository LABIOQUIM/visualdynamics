"use client";
import { useCurrentLocale } from "@/locales/client";

export function routeIsActive(pathname: string, item: NavigationItem): boolean {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useCurrentLocale();

  if (item.checkActive) {
    return item.checkActive(pathname, item);
  }

  return item?.exact
    ? pathname === `/${locale}${item?.href !== "/" ? item.href : ""}`
    : item?.href
    ? pathname.indexOf(`/${locale}${item?.href !== "/" ? item.href : ""}`) === 0
    : false;
}
