import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("x-forwarded-host") || request.nextUrl.host;

  // Check if accessing via admin subdomain
  const isAdminSubdomain = host === "admin.nguoila.online";

  // Both domains work for main site
  const isMainDomain = host === "nguoila.online" || host === "www.nguoila.online" || host === "nguoilaoi.online" || host === "www.nguoilaoi.online";

  // Always allow: API routes, static files, public pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // --- ADMIN SUBDOMAIN (admin.nguoila.online) ---
  if (isAdminSubdomain) {
    // Allow admin login without auth
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Redirect root to admin dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Block non-admin routes (users pages)
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Check auth for admin routes
    const hasAuth =
      request.cookies.has("access_token") || request.cookies.has("refresh_token");

    if (!hasAuth) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // --- MAIN DOMAIN (nguoila.online / nguoilaoi.online) ---
  // Block admin routes on main domain
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow public pages without auth
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/faq" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/about" ||
    pathname === "/phap-ly"
  ) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  const hasAuth =
    request.cookies.has("access_token") || request.cookies.has("refresh_token");

  if (!hasAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
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
  matcher: ["/((?!api|_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};
