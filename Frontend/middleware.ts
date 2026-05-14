import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const publicPaths = [
    "/login",
    "/api/v1/auth",
    "/api/v1/users/me",
    "/admin/login",
    "/api/v1/admin",
  ];
  const { pathname } = request.nextUrl;

  if (
    pathname.includes(".") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const hasAuth =
    request.cookies.has("access_token") || request.cookies.has("refresh_token");
  const isApiRoute = pathname.startsWith("/api/");

  if (!hasAuth && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!hasAuth && isApiRoute) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
