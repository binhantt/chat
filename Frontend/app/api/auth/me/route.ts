import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const authCookies = ["access_token", "refresh_token", "user_id"];

export async function GET(request: Request) {
  try {
    // Get cookies from the incoming request
    const cookieStore = request.headers.get("cookie") || "";
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const res = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Không thể lấy thông tin người dùng" },
        { status: res.status }
      );
    }

    const user = await res.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy thông tin người dùng" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = request.headers.get("cookie") || "";

    const res = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Không thể xoá tài khoản" },
        { status: res.status }
      );
    }

    const response = NextResponse.json({ success: true });

    for (const name of authCookies) {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        httpOnly: name !== "user_id",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi xoá tài khoản" },
      { status: 500 }
    );
  }
}
