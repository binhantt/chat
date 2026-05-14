import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
        "X-CSRF-Token":
          request.headers.get("x-csrf-token") ||
          decodeURIComponent(
            (request.headers.get("cookie") || "").match(
              /(?:^|;\s*)csrf_token=([^;]+)/,
            )?.[1] || "",
          ),
      },
      credentials: "include",
    });

    const data = await backendRes.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: backendRes.status });

    const setCookieHeaders = backendRes.headers.getSetCookie?.() ?? [];
    for (const cookie of setCookieHeaders) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { message: "Khong the lam moi phien dang nhap" },
      { status: 500 },
    );
  }
}
