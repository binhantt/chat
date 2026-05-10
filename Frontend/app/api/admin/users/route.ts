import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Get all users (admin only)
export async function GET(request: Request) {
  try {
    const cookieStore = request.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Không thể lấy danh sách người dùng" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy danh sách người dùng" },
      { status: 500 }
    );
  }
}

// Create new user (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = request.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Không thể tạo người dùng" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi tạo người dùng" },
      { status: 500 }
    );
  }
}