import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const backendRes = await fetch(`${backendUrl}/api/auth/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message || "Đăng nhập thất bại" },
        { status: backendRes.status }
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
      { message: "Đã xảy ra lỗi khi đăng nhập" },
      { status: 500 }
    );
  }
}
