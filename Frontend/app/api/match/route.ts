import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Join match queue
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
      return NextResponse.json(
        { message: "Không thể tham gia hàng đợi" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error joining queue:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi tham gia hàng đợi" },
      { status: 500 }
    );
  }
}

// Leave match queue
export async function DELETE(request: Request) {
  try {
    const cookieStore = request.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/api/match/leave`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Không thể rời hàng đợi" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error leaving queue:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi rời hàng đợi" },
      { status: 500 }
    );
  }
}

// Get match status
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

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching status:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy trạng thái tìm kiếm" },
      { status: 500 }
    );
  }
}