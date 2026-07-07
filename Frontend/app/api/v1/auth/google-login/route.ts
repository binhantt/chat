import { BACKEND_URL } from "@/lib/env";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    const backendUrl = BACKEND_URL;

    const backendRes = await fetch(`${backendUrl}/api/v1/auth/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message || "Đăng nhập thất bại" },
        { status: backendRes.status },
      );
    }

    // Create response and forward all Set-Cookie headers from backend
    const response = NextResponse.json(data);

    // Forward all cookies set by backend to the browser
    const setCookieHeaders = backendRes.headers.getSetCookie();
    for (const cookie of setCookieHeaders) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 },
    );
  }
}
