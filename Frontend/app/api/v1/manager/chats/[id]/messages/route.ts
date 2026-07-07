import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") || "100";
    const offset = url.searchParams.get("offset") || "0";
    const res = await fetch(
      `${BACKEND_URL}/api/v1/manager/chats/${id}/messages?limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: buildBackendHeaders(request, {
          "Content-Type": "application/json",
        }),
        credentials: "include",
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching admin chat messages:", error);
    return NextResponse.json(
      { message: "Cannot fetch conversation messages" },
      { status: 500 },
    );
  }
}
