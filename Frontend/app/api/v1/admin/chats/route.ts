import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") || "50";
    const offset = url.searchParams.get("offset") || "0";

    const res = await fetch(`${BACKEND_URL}/api/v1/admin/chats?limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching admin chats:", error);
    return NextResponse.json(
      { message: "Khong the lay danh sach cuoc tro chuyen" },
      { status: 500 },
    );
  }
}
