export function parsePathname(pathname: string) {
  let temp = pathname.split("?")[0];

  return temp.endsWith("/") ? temp.slice(0, -1) : temp;
}

export function dateFormat(date?: string | null | Date) {
  if (!date) {
    return null;
  }

  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    localeMatcher: "lookup",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function dateFormatWithSecs(date?: string | null | Date) {
  if (!date) {
    return null;
  }

  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    localeMatcher: "lookup",
    timeZone: "UTC",
  }).format(new Date(date));
}

export function dateFormatMobileWithSecs(date?: string | null | Date) {
  if (!date) {
    return null;
  }

  return Intl.DateTimeFormat("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    localeMatcher: "lookup",
    timeZone: "UTC",
  }).format(new Date(date));
}
