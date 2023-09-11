import { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";
import { createI18nMiddleware } from "next-international/middleware";

const locales = ["en-US", "pt-BR"] as const;
const publicPages = [
  "/",
  "/login",
  "/register",
  "/about",
  "/reset",
  "/docs",
  "/knowledge"
];

const I18nMiddleware = createI18nMiddleware(locales, "en-US");

const authMiddleware = withAuth(
  function onSuccess(req) {
    return I18nMiddleware(req);
  },
  {
    pages: {
      signIn: "/login"
    }
  }
);

export function middleware(req: NextRequest) {
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join("|")}))?(${publicPages.join("|")})?/?.*$`,
    "i"
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    return I18nMiddleware(req);
  } else {
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|directus|favicon.ico).*)"]
};
