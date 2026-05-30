import { NextResponse } from "next/server";
import {
  applyBackendSetCookies,
  applyCsrfCookie,
  buildBackendHeaders,
  buildBackendHeadersFromCookie,
  buildBackendHeadersWithFreshCsrf,
  isCsrfError,
  isMissingAccessTokenError,
  refreshBackendSessionCookie,
} from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const payload = JSON.stringify(body);
    let backendHeaders = buildBackendHeaders(request, {
      "Content-Type": "application/json",
    });

    let res = await fetch(`${BACKEND_URL}/api/v1/users/setup-profile`, {
      method: "POST",
      headers: backendHeaders,
      credentials: "include",
      body: payload,
    });

    let data = await res.json().catch(() => null);

    if ((res.status === 401 && isMissingAccessTokenError(data)) || (res.status === 403 && isCsrfError(data))) {
      const refreshedCookieHeader = await refreshBackendSessionCookie(request, BACKEND_URL);
      backendHeaders = refreshedCookieHeader
        ? buildBackendHeadersFromCookie(refreshedCookieHeader, {
            "Content-Type": "application/json",
          })
        : buildBackendHeadersWithFreshCsrf(request, {
            "Content-Type": "application/json",
          });

      res = await fetch(`${BACKEND_URL}/api/v1/users/setup-profile`, {
        method: "POST",
        headers: backendHeaders,
        credentials: "include",
        body: payload,
      });
      data = await res.json().catch(() => null);
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Cannot update profile" },
        { status: res.status },
      );
    }

    const response = NextResponse.json(data);
    applyBackendSetCookies(response, res);
    applyCsrfCookie(response, request, backendHeaders);
    return response;
  } catch (error) {
    console.error("Error setting up profile:", error);
    return NextResponse.json(
      { message: "An error occurred while updating profile" },
      { status: 500 },
    );
  }
}
