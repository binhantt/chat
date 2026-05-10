import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const cookieStore = request.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/api/match/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { message: error.message || "Không thể tham gia hàng đợi tìm kiếm" },
        { status: res.status }
      );
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error joining match queue:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi tham gia hàng đợi tìm kiếm" },
      { status: 500 }
    );
  }
}