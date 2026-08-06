import { NextResponse } from "next/server";
import {
  applyBackendSetCookies,
  buildBackendHeaders,
  buildBackendHeadersFromCookie,
  isMissingAccessTokenError,
  refreshBackendSessionCookie,
} from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const payload = JSON.stringify({});
    let backendHeaders = buildBackendHeaders(request, {
      "Content-Type": "application/json",
    });
    let res = await fetch(`${BACKEND_URL}/api/v1/users/unlink-google`, {
      method: "POST",
      headers: backendHeaders,
      credentials: "include",
      body: payload,
    });
    let data = await res.json().catch(() => ({}));

    if (res.status === 401 && isMissingAccessTokenError(data)) {
      const refreshedCookieHeader = await refreshBackendSessionCookie(
        request,
        BACKEND_URL,
      );
      if (refreshedCookieHeader) {
        backendHeaders = buildBackendHeadersFromCookie(refreshedCookieHeader, {
          "Content-Type": "application/json",
        });
        res = await fetch(`${BACKEND_URL}/api/v1/users/unlink-google`, {
          method: "POST",
          headers: backendHeaders,
          credentials: "include",
          body: payload,
        });
        data = await res.json().catch(() => ({}));
      }
    }

    const response = NextResponse.json(data, { status: res.status });
    applyBackendSetCookies(response, res);
    return response;
  } catch (error) {
    console.error("Error unlinking Google:", error);
    return NextResponse.json(
      { message: "Cannot unlink Google account" },
      { status: 500 },
    );
  }
}
