import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function proxyJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/conduct-rules`, {
      method: "GET",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    return proxyJson(res);
  } catch (error) {
    console.error("Error fetching conduct rules:", error);
    return NextResponse.json(
      { message: "Khong the tai danh sach luat ung xu" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/api/v1/admin/conduct-rules`, {
      method: "POST",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(body),
    });

    return proxyJson(res);
  } catch (error) {
    console.error("Error creating conduct rule:", error);
    return NextResponse.json(
      { message: "Khong the tao luat ung xu" },
      { status: 500 },
    );
  }
}
