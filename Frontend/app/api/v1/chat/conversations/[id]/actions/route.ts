import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Mark conversation as read
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const body = await request.json().catch(() => ({}));

    const res = await fetch(
      `${BACKEND_URL}/api/v1/chat/conversations/${conversationId}/read`,
      {
        method: "PATCH",
        headers: buildBackendHeaders(request, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Cannot mark as read" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error marking as read:", error);
    return NextResponse.json(
      { message: "An error occurred while marking as read" },
      { status: 500 },
    );
  }
}

// Block conversation
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;

    const res = await fetch(
      `${BACKEND_URL}/api/v1/chat/conversations/${conversationId}/block`,
      {
        method: "PATCH",
        headers: buildBackendHeaders(request, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Cannot block conversation" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error blocking conversation:", error);
    return NextResponse.json(
      { message: "An error occurred while blocking conversation" },
      { status: 500 },
    );
  }
}

// End conversation
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;

    const res = await fetch(
      `${BACKEND_URL}/api/v1/chat/conversations/${conversationId}/end`,
      {
        method: "PATCH",
        headers: buildBackendHeaders(request, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Cannot end conversation" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error ending conversation:", error);
    return NextResponse.json(
      { message: "An error occurred while ending conversation" },
      { status: 500 },
    );
  }
}
