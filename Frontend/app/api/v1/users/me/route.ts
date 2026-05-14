import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const authCookies = ["access_token", "refresh_token", "user_id"];
const ME_CACHE_TTL_MS = 3000;
const meCache = new Map<string, { data: unknown; status: number; expiresAt: number }>();
const meInflight = new Map<string, Promise<{ data: unknown; status: number }>>();

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

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Khong the lay thong tin nguoi dung" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const cacheKey = getMeCacheKey(request);
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: "PATCH",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (cacheKey) {
      meCache.delete(cacheKey);
      meInflight.delete(cacheKey);
    }

    return proxyJson(res);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Khong the cap nhat thong tin nguoi dung" },
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

    for (const name of authCookies) {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        httpOnly: name !== "user_id",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { message: "Khong the xoa tai khoan" },
      { status: 500 },
    );
  }
}

async function getCachedMeResponse(
  request: Request,
  cacheKey: string,
): Promise<{ data: unknown; status: number }> {
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
): Promise<{ data: unknown; status: number }> {
  const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
    method: "GET",
    headers: buildBackendHeaders(request, {
      "Content-Type": "application/json",
    }),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  return { data, status: res.status };
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
