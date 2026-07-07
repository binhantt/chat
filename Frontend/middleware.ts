import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const hasAuth =
    request.cookies.has("access_token") || request.cookies.has("refresh_token");

  if (!hasAuth) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    const baseUrl = request.headers.get("x-forwarded-host")
      ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host")}`
      : request.nextUrl.origin;
    const loginUrl = new URL(loginPath, baseUrl);
    loginUrl.searchParams.set("returnTo", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/", "/vip", "/admin/:path*"],
};
