import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
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
