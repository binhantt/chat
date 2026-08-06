import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";
import { BACKEND_URL } from "@/lib/env";

export async function GET(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/manager/ai/settings`, {
      method: "GET",
      headers: buildBackendHeaders(request),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching AI settings:", error);
    return NextResponse.json(
      { message: "Cannot fetch AI settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`${BACKEND_URL}/api/v1/manager/ai/settings`, {
      method: "PATCH",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error updating AI settings:", error);
    return NextResponse.json(
      { message: "Cannot update AI settings" },
      { status: 500 },
    );
  }
}
