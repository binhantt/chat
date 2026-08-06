import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";
import { BACKEND_URL } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/manager/ai/test`, {
      method: "POST",
      headers: buildBackendHeaders(request),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error testing AI connection:", error);
    return NextResponse.json(
      { message: "Cannot test AI connection" },
      { status: 500 },
    );
  }
}
