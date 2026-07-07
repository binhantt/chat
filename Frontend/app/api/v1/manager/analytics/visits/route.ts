import { NextResponse } from "next/server";
import {
  applyBackendSetCookies,
  buildBackendHeaders,
  buildBackendHeadersFromCookie,
  isMissingAccessTokenError,
  refreshBackendSessionCookie,
} from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

export async function GET(request: Request) {
  try {
    let res = await fetch(`${BACKEND_URL}/api/v1/manager/analytics/visits`, {
      credentials: "include",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      method: "GET",
    });
    let data = await res.json().catch(() => ({}));

    if (res.status === 401 && isMissingAccessTokenError(data)) {
      const refreshedCookieHeader = await refreshBackendSessionCookie(request, BACKEND_URL);

      if (refreshedCookieHeader) {
        res = await fetch(`${BACKEND_URL}/api/v1/manager/analytics/visits`, {
          credentials: "include",
          headers: buildBackendHeadersFromCookie(refreshedCookieHeader, {
            "Content-Type": "application/json",
          }),
          method: "GET",
        });
        data = await res.json().catch(() => ({}));
      }
    }

    const response = NextResponse.json(data, { status: res.status });
    applyBackendSetCookies(response, res);
    return response;
  } catch (error) {
    console.error("Error fetching visit stats:", error);
    return NextResponse.json({ message: "Cannot fetch visit stats" }, { status: 500 });
  }
}
