import { NextResponse } from "next/server";
import {
  applyCsrfCookie,
  buildBackendHeadersFromCookie,
  buildBackendHeaders,
  buildBackendHeadersWithFreshCsrf,
  mergeSetCookiesIntoCookieHeader,
} from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    let backendHeaders = buildBackendHeaders(request, {
      "Content-Type": "application/json",
    });

    let res = await fetch(
      `${BACKEND_URL}/api/v1/chat/conversations/${conversationId}/accept`,
      {
        method: "PATCH",
        headers: backendHeaders,
        credentials: "include",
      },
    );

    let data = await res.json().catch(() => ({}));

    if (res.status === 403 && isCsrfError(data)) {
      const refreshedCookieHeader = await refreshBackendSessionCookie(request);
      backendHeaders = refreshedCookieHeader
        ? buildBackendHeadersFromCookie(refreshedCookieHeader, {
            "Content-Type": "application/json",
          })
        : buildBackendHeadersWithFreshCsrf(request, {
        "Content-Type": "application/json",
      });

      res = await fetch(
        `${BACKEND_URL}/api/v1/chat/conversations/${conversationId}/accept`,
        {
          method: "PATCH",
          headers: backendHeaders,
          credentials: "include",
        },
      );
      data = await res.json().catch(() => ({}));
    }

    const response = NextResponse.json(data, { status: res.status });
    applyCsrfCookie(response, request, backendHeaders);
    return response;
  } catch (error) {
    console.error("Error accepting conversation:", error);
    return NextResponse.json(
      { message: "Cannot accept conversation" },
      { status: 500 },
    );
  }
}

function isCsrfError(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    String(data.message).toLowerCase().includes("csrf")
  );
}

async function refreshBackendSessionCookie(
  request: Request,
): Promise<string | null> {
  const refreshRes = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: buildBackendHeaders(request, {
      "Content-Type": "application/json",
    }),
    credentials: "include",
  });

  if (!refreshRes.ok) {
    return null;
  }

  const setCookies = refreshRes.headers.getSetCookie?.() ?? [];
  if (setCookies.length === 0) {
    return null;
  }

  return mergeSetCookiesIntoCookieHeader(
    request.headers.get("cookie") || "",
    setCookies,
  );
}
