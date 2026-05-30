import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/reports/reportable-users`, {
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
    console.error("Error fetching reportable users:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching reportable users" },
      { status: 500 },
    );
  }
}
