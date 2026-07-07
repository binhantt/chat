import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

export async function GET(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/match/status`, {
      method: "GET",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Cannot fetch search status" },
        { status: res.status },
      );
    }

    const status = await res.json();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching match status:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching search status" },
      { status: 500 },
    );
  }
}
