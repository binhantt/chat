import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;

    const res = await fetch(
      `${BACKEND_URL}/api/v1/chat/conversations/${conversationId}`,
      {
        method: "GET",
        headers: buildBackendHeaders(request, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Không thể lấy thông tin cuộc trò chuyện" },
        { status: res.status },
      );
    }

    const conversation = await res.json();
    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy thông tin cuộc trò chuyện" },
      { status: 500 },
    );
  }
}
