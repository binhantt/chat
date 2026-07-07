import { NextResponse } from "next/server";
import {
  applyBackendSetCookies,
  buildBackendHeaders,
  buildBackendHeadersFromCookie,
  isMissingAccessTokenError,
  refreshBackendSessionCookie,
} from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";
const authCookies = ["access_token", "refresh_token", "user_id", "csrf_token"];
const ME_CACHE_TTL_MS = 60 * 1000;
const meCache = new Map<string, { data: unknown; status: number; expiresAt: number }>();
const meInflight = new Map<string, Promise<BackendJsonResult>>();

type BackendJsonResult = {
  data: unknown;
  response: Response;
  status: number;
};

async function proxyJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: Request) {
  try {
    const cacheKey = getMeCacheKey(request);
    const cached = cacheKey ? meCache.get(cacheKey) : null;

    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data, { status: cached.status });
    }

    const result = cacheKey
      ? await getCachedMeResponse(request, cacheKey)
      : await fetchMeFromBackend(request);

    const response = NextResponse.json(result.data, { status: result.status });
    applyBackendSetCookies(response, result.response);
    if (result.status === 401 && isLockedSessionResponse(result.data)) {
      clearAuthCookies(response);
      if (cacheKey) {
        meCache.delete(cacheKey);
        meInflight.delete(cacheKey);
      }
    }
    return response;
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Cannot fetch user information" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cacheKey = getMeCacheKey(request);
    const body = await request.json().catch(() => ({}));
    const payload = JSON.stringify(body);
    let backendHeaders = buildBackendHeaders(request, {
      "Content-Type": "application/json",
    });
    let res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: "PATCH",
      headers: backendHeaders,
      credentials: "include",
      body: payload,
    });
    let data = await res.json().catch(() => ({}));

    if (res.status === 401 && isMissingAccessTokenError(data)) {
      const refreshedCookieHeader = await refreshBackendSessionCookie(request, BACKEND_URL);
      if (refreshedCookieHeader) {
        backendHeaders = buildBackendHeadersFromCookie(refreshedCookieHeader, {
          "Content-Type": "application/json",
        });
        res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
          method: "PATCH",
          headers: backendHeaders,
          credentials: "include",
          body: payload,
        });
        data = await res.json().catch(() => ({}));
      }
    }

    if (cacheKey) {
      meCache.delete(cacheKey);
      meInflight.delete(cacheKey);
    }

    const response = NextResponse.json(data, { status: res.status });
    applyBackendSetCookies(response, res);
    if (res.status === 401 && isLockedSessionResponse(data)) {
      clearAuthCookies(response);
    }
    return response;
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Cannot update user information" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const cacheKey = getMeCacheKey(request);
    const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: "DELETE",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    if (!res.ok) {
      return proxyJson(res);
    }

    if (cacheKey) {
      meCache.delete(cacheKey);
      meInflight.delete(cacheKey);
    }

    const response = NextResponse.json({ success: true });

    clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { message: "Cannot delete account" },
      { status: 500 },
    );
  }
}

async function getCachedMeResponse(
  request: Request,
  cacheKey: string,
): Promise<BackendJsonResult> {
  const existing = meInflight.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = fetchMeFromBackend(request)
    .then((result) => {
      if (result.status === 200) {
        meCache.set(cacheKey, {
          ...result,
          expiresAt: Date.now() + ME_CACHE_TTL_MS,
        });
      }
      return result;
    })
    .finally(() => {
      meInflight.delete(cacheKey);
    });

  meInflight.set(cacheKey, promise);
  return promise;
}

async function fetchMeFromBackend(
  request: Request,
): Promise<BackendJsonResult> {
  const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
    method: "GET",
    headers: buildBackendHeaders(request, {
      "Content-Type": "application/json",
    }),
    credentials: "include",
  });
  let data = await res.json().catch(() => ({}));

  if (res.status !== 401 || !isMissingAccessTokenError(data)) {
    return { data, response: res, status: res.status };
  }

  const refreshedCookieHeader = await refreshBackendSessionCookie(request, BACKEND_URL);
  if (!refreshedCookieHeader) {
    return { data, response: res, status: res.status };
  }

  const retryRes = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
    method: "GET",
    headers: buildBackendHeadersFromCookie(refreshedCookieHeader, {
      "Content-Type": "application/json",
    }),
    credentials: "include",
  });
  data = await retryRes.json().catch(() => ({}));
  return { data, response: retryRes, status: retryRes.status };
}

function clearAuthCookies(response: NextResponse): void {
  for (const name of authCookies) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: name !== "user_id" && name !== "csrf_token",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  }
}

function isLockedSessionResponse(data: unknown): boolean {
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return false;
  }

  const message = String(data.message).toLowerCase();
  return (
    message.includes("khoa") ||
    message.includes("vi pham") ||
    message.includes("banned") ||
    message.includes("locked")
  );
}

function getMeCacheKey(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const accessToken = getCookieValue(cookieHeader, "access_token");
  const userId = getCookieValue(cookieHeader, "user_id");

  if (!accessToken && !userId) {
    return null;
  }

  return `${userId || "unknown"}:${accessToken || "cookie"}`;
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=").slice(1).join("="));
}
