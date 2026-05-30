import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const VISITOR_ID_COOKIE = "visitor_id";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { path?: string };
  const cookieHeader = request.headers.get("cookie") || "";
  const existingVisitorId = getCookieValue(cookieHeader, VISITOR_ID_COOKIE);
  const visitorId = existingVisitorId || randomUUID();

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/analytics/visit`, {
      credentials: "include",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      method: "POST",
      body: JSON.stringify({
        path: body.path || "/",
        visitorId,
      }),
    });

    const data = await res.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: res.status });

    if (!existingVisitorId) {
      response.cookies.set(VISITOR_ID_COOKIE, visitorId, {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("Error tracking page visit:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) return null;
  return decodeURIComponent(cookie.split("=").slice(1).join("="));
}
