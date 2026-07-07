import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const body = await request.json().catch(() => ({}));

    const res = await fetch(
      `${BACKEND_URL}/api/v1/chat/conversations/${conversationId}/typing`,
      {
        method: "PATCH",
        headers: buildBackendHeaders(request, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
        body: JSON.stringify(body),
      },
    );

    if (res.status === 403 || res.status === 404) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error sending typing state:", error);
    return NextResponse.json(
      { message: "Cannot send typing state" },
      { status: 500 },
    );
  }
}
