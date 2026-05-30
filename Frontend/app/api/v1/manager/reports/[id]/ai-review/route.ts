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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    let backendHeaders = buildBackendHeaders(request, {
      "Content-Type": "application/json",
    });
    let res = await fetch(`${BACKEND_URL}/api/v1/manager/reports/${id}/ai-review`, {
      credentials: "include",
      headers: backendHeaders,
      method: "POST",
    });
    let data = await res.json().catch(() => ({}));

    if (
      (res.status === 401 && isMissingAccessTokenError(data)) ||
      (res.status === 403 && isCsrfError(data))
    ) {
      const refreshedCookieHeader = await refreshBackendSessionCookie(request, BACKEND_URL);
      backendHeaders = refreshedCookieHeader
        ? buildBackendHeadersFromCookie(refreshedCookieHeader, {
            "Content-Type": "application/json",
          })
        : buildBackendHeadersWithFreshCsrf(request, {
            "Content-Type": "application/json",
          });

      res = await fetch(`${BACKEND_URL}/api/v1/manager/reports/${id}/ai-review`, {
        credentials: "include",
        headers: backendHeaders,
        method: "POST",
      });
      data = await res.json().catch(() => ({}));
    }

    const response = NextResponse.json(data, { status: res.status });
    applyBackendSetCookies(response, res);
    applyCsrfCookie(response, request, backendHeaders);
    return response;
  } catch (error) {
    console.error("Error reviewing report with AI:", error);
    return NextResponse.json(
      { message: "Cannot review report with AI" },
      { status: 500 },
    );
  }
}
