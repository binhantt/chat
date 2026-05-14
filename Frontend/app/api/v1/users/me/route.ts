import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const authCookies = ["access_token", "refresh_token", "user_id"];

async function proxyJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: "GET",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    return proxyJson(res);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Khong the lay thong tin nguoi dung" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: "PATCH",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(body),
    });

    return proxyJson(res);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Khong the cap nhat thong tin nguoi dung" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: "DELETE",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    if (!res.ok) {
      return proxyJson(res);
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
      { message: "Khong the xoa tai khoan" },
      { status: 500 },
    );
  }
}
