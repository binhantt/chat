import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const body = await request.json().catch(() => ({}));

    const res = await fetch(`${BACKEND_URL}/api/chat/conversations/${conversationId}/typing`, {
      method: "PATCH",
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
    console.error("Error sending typing state:", error);
    return NextResponse.json(
      { message: "Không thể gửi trạng thái đang nhập" },
      { status: 500 },
    );
  }
}
