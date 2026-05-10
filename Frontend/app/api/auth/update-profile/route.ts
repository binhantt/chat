import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function PATCH(request: Request) {
  try {
    // Get cookies from the incoming request
    const cookieStore = request.headers.get("cookie") || "";
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { message: error.message || "Không thể cập nhật thông tin người dùng" },
        { status: res.status }
      );
    }

    const user = await res.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi cập nhật thông tin người dùng" },
      { status: 500 }
    );
  }
}