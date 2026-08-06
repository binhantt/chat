import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/env";

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const item of cookieHeader.split(";")) {
    const [key, ...rest] = item.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function proxyApiRequest(
  request: Request,
  path: string,
): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.toString();
    const fullUrl = `${BACKEND_URL}${path}${search ? `?${search}` : ""}`;

    const body = ["POST", "PATCH", "PUT"].includes(request.method)
      ? await request.json().catch(() => undefined)
      : undefined;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-internal-api-proxy": "next",
    };

    // Forward cookies from the incoming request
    const cookie = request.headers.get("cookie") || "";
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    // CRITICAL: Read CSRF token from cookie and set as BOTH cookie and header
    const csrfToken =
      request.headers.get("x-csrf-token") ||
      getCookieValue(cookie, "csrf_token") ||
      "";
    if (csrfToken) {
      headers["x-csrf-token"] = csrfToken;
      // Ensure CSRF cookie is in the forwarded cookie string
      if (!cookie.includes("csrf_token=")) {
        headers["Cookie"] = `${cookie}; csrf_token=${csrfToken}`;
      }
    }

    const res = await fetch(fullUrl, {
      method: request.method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const data = await res.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: res.status });

    // Forward Set-Cookie headers
    try {
      const setCookieHeaders = res.headers.getSetCookie();
      for (const c of setCookieHeaders) {
        response.headers.append("Set-Cookie", c);
      }
    } catch {
      // getSetCookie might not be available in all Node versions
    }

    return response;
  } catch (error) {
    console.error(`Proxy error for ${path}:`, error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function handleProxyRoute(
  request: Request,
): Promise<NextResponse> {
  const url = new URL(request.url);
  return proxyApiRequest(request, url.pathname);
}
