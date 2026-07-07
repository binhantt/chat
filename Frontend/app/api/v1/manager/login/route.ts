import { NextResponse } from "next/server";

import { BACKEND_URL } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email và mật khẩu không được để trống" },
        { status: 400 },
      );
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/manager/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await backendRes.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: backendRes.status });

    for (const cookie of backendRes.headers.getSetCookie()) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Dang nhap that bai" },
      { status: 500 },
    );
  }
}
