import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Update user access (ban/unban, role change)
export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookieStore = request.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/api/admin/users/${id}/access`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Không thể cập nhật quyền truy cập" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating user access:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi cập nhật quyền truy cập" },
      { status: 500 }
    );
  }
}