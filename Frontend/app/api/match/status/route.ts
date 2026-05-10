import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: Request) {
  try {
    const cookieStore = request.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/api/match/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Không thể lấy trạng thái tìm kiếm" },
        { status: res.status }
      );
    }

    const status = await res.json();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching match status:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy trạng thái tìm kiếm" },
      { status: 500 }
    );
  }
}