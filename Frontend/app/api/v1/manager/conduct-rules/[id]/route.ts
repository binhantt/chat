import { NextResponse } from "next/server";
import {
  applyCsrfCookie,
  buildBackendHeaders,
  buildBackendHeadersFromCookie,
  buildBackendHeadersWithFreshCsrf,
  isCsrfError,
  refreshBackendSessionCookie,
} from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const payload = JSON.stringify(body);
    let backendHeaders = buildBackendHeaders(request, {
      "Content-Type": "application/json",
    });
    let res = await fetch(`${BACKEND_URL}/api/v1/manager/conduct-rules/${id}`, {
      method: "PATCH",
      headers: backendHeaders,
      credentials: "include",
      body: payload,
    });
    let data = await res.json().catch(() => ({}));

    if (res.status === 403 && isCsrfError(data)) {
      const refreshedCookieHeader = await refreshBackendSessionCookie(request, BACKEND_URL);
      backendHeaders = refreshedCookieHeader
        ? buildBackendHeadersFromCookie(refreshedCookieHeader, {
            "Content-Type": "application/json",
          })
        : buildBackendHeadersWithFreshCsrf(request, {
        "Content-Type": "application/json",
      });

      res = await fetch(`${BACKEND_URL}/api/v1/manager/conduct-rules/${id}`, {
        method: "PATCH",
        headers: backendHeaders,
      credentials: "include",
        body: payload,
    });
      data = await res.json().catch(() => ({}));
    }

    const response = NextResponse.json(data, { status: res.status });
    applyCsrfCookie(response, request, backendHeaders);
    return response;
  } catch (error) {
    console.error("Error updating conduct rule:", error);
    return NextResponse.json(
      { message: "Cannot update conduct rule" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    let backendHeaders = buildBackendHeaders(request, {
      "Content-Type": "application/json",
    });
    let res = await fetch(`${BACKEND_URL}/api/v1/manager/conduct-rules/${id}`, {
      method: "DELETE",
      headers: backendHeaders,
      credentials: "include",
    });
    let data = await res.json().catch(() => ({}));

    if (res.status === 403 && isCsrfError(data)) {
      const refreshedCookieHeader = await refreshBackendSessionCookie(request, BACKEND_URL);
      backendHeaders = refreshedCookieHeader
        ? buildBackendHeadersFromCookie(refreshedCookieHeader, {
            "Content-Type": "application/json",
          })
        : buildBackendHeadersWithFreshCsrf(request, {
            "Content-Type": "application/json",
          });

      res = await fetch(`${BACKEND_URL}/api/v1/manager/conduct-rules/${id}`, {
        method: "DELETE",
        headers: backendHeaders,
        credentials: "include",
      });
      data = await res.json().catch(() => ({}));
    }

    const response = NextResponse.json(data, { status: res.status });
    applyCsrfCookie(response, request, backendHeaders);
    return response;
  } catch (error) {
    console.error("Error deleting conduct rule:", error);
    return NextResponse.json(
      { message: "Cannot delete conduct rule" },
      { status: 500 },
    );
  }
}
