import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { detectLocaleFromAcceptLanguage } from "@/lib/i18n/detect";
import { LOCALE_COOKIE } from "@/lib/i18n/locales";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.get(LOCALE_COOKIE)?.value) {
    const locale = detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)"],
};
