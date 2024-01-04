"use client";

export function dateFormat(date: Date, locale = "en-US") {
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
