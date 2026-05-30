import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const USERS_CACHE_TTL_MS = 3000;
const usersCache = new Map<string, { data: unknown; status: number; expiresAt: number }>();
const usersInflight = new Map<string, Promise<{ data: unknown; status: number }>>();

async function proxyJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const cacheKey = `${request.headers.get("cookie") || ""}:${query}`;
    const cached = usersCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data, { status: cached.status });
    }

    const existing = usersInflight.get(cacheKey);
    const resultPromise = existing ?? fetchUsersFromBackend(request, query);

    if (!existing) {
      usersInflight.set(cacheKey, resultPromise);
    }

    const result = await resultPromise.finally(() => {
      usersInflight.delete(cacheKey);
    });

    if (result.status === 200) {
      usersCache.set(cacheKey, {
        ...result,
        expiresAt: Date.now() + USERS_CACHE_TTL_MS,
      });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { message: "Cannot fetch users list" },
      { status: 500 },
    );
  }
}

async function fetchUsersFromBackend(
  request: Request,
  query: string,
): Promise<{ data: unknown; status: number }> {
  const res = await fetch(`${BACKEND_URL}/api/v1/manager/users${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: buildBackendHeaders(request, {
      "Content-Type": "application/json",
    }),
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  return { data, status: res.status };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/api/v1/manager/users`, {
      method: "POST",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(body),
    });

    usersCache.clear();
    usersInflight.clear();
    return proxyJson(res);
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { message: "Cannot create user" },
      { status: 500 },
    );
  }
}
