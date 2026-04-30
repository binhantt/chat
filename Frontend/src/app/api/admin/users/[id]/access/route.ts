import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export const runtime = "nodejs";

const INVALID_PAYLOAD_MESSAGE = "Du lieu cap nhat quyen khong hop le.";
const BACKEND_UNAVAILABLE_MESSAGE =
  "Khong the ket noi toi may chu backend. Vui long thu lai.";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: INVALID_PAYLOAD_MESSAGE },
      { status: 400 },
    );
  }

  if (!isAccessPayload(payload)) {
    return NextResponse.json(
      { message: INVALID_PAYLOAD_MESSAGE },
      { status: 400 },
    );
  }

  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return NextResponse.json(
      { message: "Missing backend URL configuration." },
      { status: 500 },
    );
  }

  const { id } = await context.params;

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(`${backendUrl}/admin/users/${id}/access`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      { message: BACKEND_UNAVAILABLE_MESSAGE },
      { status: 502 },
    );
  }

  const bodyText = await upstreamResponse.text();
  const contentType =
    upstreamResponse.headers.get("content-type") ??
    "application/json; charset=utf-8";

  return new NextResponse(bodyText || null, {
    status: upstreamResponse.status,
    headers: {
      "content-type": contentType,
    },
  });
}

function isAccessPayload(value: unknown): value is {
  role: "admin" | "user";
  isActive: boolean;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    (payload.role === "admin" || payload.role === "user") &&
    typeof payload.isActive === "boolean"
  );
}
