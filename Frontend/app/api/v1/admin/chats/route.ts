import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/chats`, {
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
