import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

    if (res.status === 404 || data?.message === "Cuoc tro chuyen da ket thuc") {
      return NextResponse.json({ ok: true, stale: true });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error ending conversation:", error);
    return NextResponse.json(
      { message: "Không thể thoát cuộc trò chuyện" },
      { status: 500 },
    );
  }
}
