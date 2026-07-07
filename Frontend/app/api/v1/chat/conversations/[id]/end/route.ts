import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
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

    const data = await res.json().catch(() => ({}));

    if (res.status === 404 || data?.message === "Conversation has ended") {
      return NextResponse.json({ ok: true, stale: true });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error ending conversation:", error);
    return NextResponse.json(
      { message: "Cannot leave conversation" },
      { status: 500 },
    );
  }
}
