import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const cookieStore = request.headers.get("cookie") || "";
    const searchParams = new URL(request.url).searchParams;
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const res = await fetch(
      `${BACKEND_URL}/api/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookieStore,
        },
        credentials: "include",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Không thể lấy tin nhắn" },
        { status: res.status }
      );
    }

    const messages = await res.json();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi lấy tin nhắn" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const cookieStore = request.headers.get("cookie") || "";
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/api/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { message: error.message || "Không thể gửi tin nhắn" },
        { status: res.status }
      );
    }

    const message = await res.json();
    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi gửi tin nhắn" },
      { status: 500 }
    );
  }
}