import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripLocaleFromPath, toInternalPath } from "./lib/i18nRoutes";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { locale, pathWithoutLocale, hadLocalePrefix } =
    stripLocaleFromPath(pathname);

  // Next.js internals + public assets should never be locale-prefixed.
  // If a locale prefix sneaks in (e.g. via a <base> tag or relative URL),
  // rewrite to the non-prefixed path so assets/HMR/etc keep working.
  if (
    hadLocalePrefix &&
    (pathWithoutLocale.startsWith("/_next") ||
      pathWithoutLocale.startsWith("/api") ||
      PUBLIC_FILE.test(pathWithoutLocale))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathWithoutLocale;
    return NextResponse.redirect(url);
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (!hadLocalePrefix) {
    return NextResponse.next();
  }

  const internalPath = toInternalPath(pathWithoutLocale, locale);
  const url = request.nextUrl.clone();
  url.pathname = internalPath;
  const response = NextResponse.rewrite(url);
  response.headers.set("x-locale", locale);
  return response;
}

export const config = {
  matcher: [
    // Always handle locale-prefixed paths (including accidental /{locale}/_next/*).
    "/:locale(en|me|ru)/:path*",
    // For non-locale paths, skip Next internals, API routes, and public files.
    "/((?!_next|api|.*\\..*).*)",
  ],
};
