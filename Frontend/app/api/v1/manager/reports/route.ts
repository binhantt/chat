import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const REPORTS_CACHE_TTL_MS = 3000;
const reportsCache = new Map<string, { data: unknown; status: number; expiresAt: number }>();
const reportsInflight = new Map<string, Promise<{ data: unknown; status: number }>>();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const cacheKey = `${request.headers.get("cookie") || ""}:${url.search}`;
    const cached = reportsCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data, { status: cached.status });
    }

    const existing = reportsInflight.get(cacheKey);
    const resultPromise = existing ?? fetchReportsFromBackend(request, url.search);

    if (!existing) {
      reportsInflight.set(cacheKey, resultPromise);
    }

    const result = await resultPromise.finally(() => {
      reportsInflight.delete(cacheKey);
    });

    if (result.status === 200) {
      reportsCache.set(cacheKey, {
        ...result,
        expiresAt: Date.now() + REPORTS_CACHE_TTL_MS,
      });
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    return NextResponse.json(
      { message: "Cannot fetch reports list" },
      { status: 500 },
    );
  }
}

async function fetchReportsFromBackend(
  request: Request,
  search: string,
): Promise<{ data: unknown; status: number }> {
  const res = await fetch(`${BACKEND_URL}/api/v1/manager/reports${search}`, {
    method: "GET",
    headers: buildBackendHeaders(request, {
      "Content-Type": "application/json",
    }),
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  return { data, status: res.status };
}
