import { NextResponse } from "next/server";

import { BACKEND_URL } from "@/lib/env";

export async function GET(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/reports/my-reports`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
        "X-CSRF-Token":
          request.headers.get("x-csrf-token") ||
          decodeURIComponent(
            (request.headers.get("cookie") || "").match(
              /(?:^|;\s*)csrf_token=([^;]+)/,
            )?.[1] || "",
          ),
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching my reports:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching report history" },
      { status: 500 },
    );
  }
}
