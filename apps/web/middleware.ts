import { NextRequest } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

export const config = {
  matcher: ["/((?!api|static|_next|favicon.ico|robots.txt|sw.js).*)"],
};

const I18nMiddlewareInstance = createI18nMiddleware({
  locales: ["en-US"],
  defaultLocale: "en-US",
  urlMappingStrategy: "rewrite",
});

export default function middleware(req: NextRequest) {
  return I18nMiddlewareInstance(req);
}
