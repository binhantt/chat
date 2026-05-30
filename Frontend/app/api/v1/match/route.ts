import { NextResponse } from "next/server";
import { buildBackendHeaders } from "@/app/api/_utils/backendHeaders";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Join match queue
export async function POST(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/match/join`, {
      method: "POST",
      headers: buildBackendHeaders(request, {
        "Content-Type": "application/json",
      }),
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Cannot join queue" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error joining queue:", error);
    return NextResponse.json(
      { message: "An error occurred while joining queue" },
      { status: 500 },
    );
  }
}

// Leave match queue
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
      return NextResponse.json(
        { message: "Cannot leave queue" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error leaving queue:", error);
    return NextResponse.json(
      { message: "An error occurred while leaving queue" },
      { status: 500 },
    );
  }
}

// Get match status
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

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching status:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching search status" },
      { status: 500 },
    );
  }
}
