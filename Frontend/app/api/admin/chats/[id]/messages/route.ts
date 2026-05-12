import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") || "100";
    const offset = url.searchParams.get("offset") || "0";
    const cookieStore = request.headers.get("cookie") || "";

    const res = await fetch(
      `${BACKEND_URL}/api/chat/admin/conversations/${id}/messages?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStore,
        },
        credentials: "include",
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching admin chat messages:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy tin nhắn cuộc trò chuyện" },
      { status: 500 },
    );
  }
}
