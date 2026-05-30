import { NextResponse } from "next/server";
import {
  applyCsrfCookie,
  buildBackendHeaders,
  buildBackendHeadersFromCookie,
  buildBackendHeadersWithFreshCsrf,
  isCsrfError,
  refreshBackendSessionCookie,
} from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function proxyJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const res = await fetch(`${BACKEND_URL}/api/v1/manager/conduct-rules${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    return proxyJson(res);
  } catch (error) {
    console.error("Error fetching conduct rules:", error);
    return NextResponse.json(
      { message: "Cannot fetch conduct rules list" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const payload = JSON.stringify(body);
    let backendHeaders = buildBackendHeaders(request, {
      "Content-Type": "application/json",
    });
    let res = await fetch(`${BACKEND_URL}/api/v1/manager/conduct-rules`, {
      method: "POST",
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

      res = await fetch(`${BACKEND_URL}/api/v1/manager/conduct-rules`, {
        method: "POST",
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
    console.error("Error creating conduct rule:", error);
    return NextResponse.json(
      { message: "Cannot create conduct rule" },
      { status: 500 },
    );
  }
}
