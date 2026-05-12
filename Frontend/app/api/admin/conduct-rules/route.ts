import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/conduct-rules`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching conduct rules:", error);
    return NextResponse.json(
      { message: "Không thể tải danh sách luật ứng xử" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/api/admin/conduct-rules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error creating conduct rule:", error);
    return NextResponse.json(
      { message: "Không thể tạo luật ứng xử" },
      { status: 500 },
    );
  }
}
