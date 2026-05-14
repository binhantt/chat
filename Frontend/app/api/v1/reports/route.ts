import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getCookieHeader(request: Request) {
  return request.headers.get("cookie") || "";
}

function getCsrfToken(request: Request) {
  return (
    request.headers.get("x-csrf-token") ||
    decodeURIComponent(
      getCookieHeader(request).match(/(?:^|;\s*)csrf_token=([^;]+)/)?.[1] || "",
    )
  );
}

async function proxyJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/v1/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: getCookieHeader(request),
        "X-CSRF-Token": getCsrfToken(request),
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    return proxyJson(res);
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { message: "Da xay ra loi khi gui bao cao" },
      { status: 500 },
    );
  }
}
