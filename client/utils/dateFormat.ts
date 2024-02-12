"use client";

export function dateFormat(
  date: Date,
  locale = "en-US",
  omitHours = false,
  shortest = false
) {
  return Intl.DateTimeFormat(locale, {
    day: "2-digit",
    hour: omitHours ? undefined : "2-digit",
    hour12: false,
    minute: omitHours ? undefined : "2-digit",
    month: shortest ? "2-digit" : "short",
    second: omitHours ? undefined : "2-digit",
    timeZoneName: omitHours ? undefined : "short",
    year: shortest ? "2-digit" : "numeric",
    timeZone: "UTC"
  }).format(date);
}
