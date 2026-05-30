import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const searchParams = new URL(request.url).searchParams;
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const res = await fetch(
      `${BACKEND_URL}/api/v1/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
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
        { message: "Cannot fetch messages" },
        { status: res.status },
      );
    }

    const messages = await res.json();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching messages" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const body = await request.json();

    const res = await fetch(
      `${BACKEND_URL}/api/v1/chat/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: buildBackendHeaders(request, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { message: error.message || "Cannot send message" },
        { status: res.status },
      );
    }

    const message = await res.json();
    return NextResponse.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "An error occurred while sending message" },
      { status: 500 },
    );
  }
}
