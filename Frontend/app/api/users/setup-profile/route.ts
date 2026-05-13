import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const cookieStore = request.headers.get("cookie") || "";
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/api/users/setup-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieStore,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Không thể cập nhật hồ sơ" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error setting up profile:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi cập nhật hồ sơ" },
      { status: 500 },
    );
  }
}
