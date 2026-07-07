import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.toString();

    const res = await fetch(`${BACKEND_URL}/api/v1/manager/chats${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching admin chats:", error);
    return NextResponse.json(
      { message: "Cannot fetch conversation list" },
      { status: 500 },
    );
  }
}
