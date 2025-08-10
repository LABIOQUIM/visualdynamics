import { NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

import { RouteLinks } from "./app/_constants/routes";

export const config = {
  matcher: ["/((?!api|static|_next|favicon.ico|robots.txt|sw.js).*)"],
};

const I18nMiddlewareInstance = createI18nMiddleware({
  locales: ["en-US"],
  defaultLocale: "en-US",
  urlMappingStrategy: "rewrite",
});

interface PublicRoute {
  path: string;
  whenAuthenticated: "redirect" | "donothing";
  mode?: "startsWith";
}

const publicRoutes: PublicRoute[] = [
  { path: RouteLinks.HOME, whenAuthenticated: "donothing" },
  { path: RouteLinks.LOGIN, whenAuthenticated: "redirect" },
  { path: RouteLinks.REGISTER, whenAuthenticated: "redirect" },
  { path: RouteLinks.ANALYTICS, whenAuthenticated: "donothing" },
  { path: RouteLinks.GUIDES, whenAuthenticated: "donothing" },
  {
    path: RouteLinks.EMAIL_VALIDATION,
    whenAuthenticated: "donothing",
    mode: "startsWith",
  },
  {
    path: RouteLinks.PASSWORD_RESET,
    whenAuthenticated: "donothing",
    mode: "startsWith",
  },
];

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = RouteLinks.HOME;
const REDIRECT_WHEN_AUTHENTICATED_ROUTE = RouteLinks.SIMULATIONS;

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) =>
    route.mode === "startsWith"
      ? path.startsWith(route.path)
      : route.path === path
  );
  const authToken = request.cookies.get("session");

  if (
    authToken &&
    publicRoute &&
    publicRoute.whenAuthenticated === "redirect"
  ) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = REDIRECT_WHEN_AUTHENTICATED_ROUTE;

    return NextResponse.redirect(redirectUrl);
  }

  if (!authToken && publicRoute) {
    return I18nMiddlewareInstance(request);
  }

  if (!authToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;

    return NextResponse.redirect(redirectUrl);
  }

  return I18nMiddlewareInstance(request);
}
