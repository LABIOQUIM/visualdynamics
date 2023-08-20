"use client";
import { useCurrentLocale } from "@/locales/client";

export function dateFormat(date: Date) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useCurrentLocale();

  return Intl.DateTimeFormat(locale, {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "short",
    second: "2-digit",
    timeZoneName: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}
