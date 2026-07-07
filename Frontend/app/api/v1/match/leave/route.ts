import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

import { BACKEND_URL } from "@/lib/env";

export async function DELETE(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/match/leave`, {
      method: "DELETE",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { message: error.message || "Cannot leave search queue" },
        { status: res.status },
      );
    }

    const result = await res.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error leaving match queue:", error);
    return NextResponse.json(
      { message: "An error occurred while leaving search queue" },
      { status: 500 },
    );
  }
}
