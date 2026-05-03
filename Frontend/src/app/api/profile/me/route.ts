import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";
import { getAuthenticatedUserId } from "@/lib/auth-session";

export const runtime = "nodejs";

const UNAUTHORIZED_MESSAGE = "Phien dang nhap da het han. Vui long dang nhap lai.";

export async function GET(request: NextRequest) {
  return proxyProfileRequest(request, "GET");
}

export async function PATCH(request: NextRequest) {
  return proxyProfileRequest(request, "PATCH");
}

async function proxyProfileRequest(request: NextRequest, method: "GET" | "PATCH") {
  const backendUrl = getBackendUrl();
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ message: UNAUTHORIZED_MESSAGE }, { status: 401 });
  }

  if (!backendUrl) {
    return NextResponse.json(
      { message: "May chu backend chua duoc cau hinh." },
      { status: 503 },
    );
  }

  let body: string | undefined;

  if (method === "PATCH") {
    try {
      body = JSON.stringify(await request.json());
    } catch {
      return NextResponse.json(
        { message: "Du lieu cap nhat khong hop le." },
        { status: 400 },
      );
    }
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${backendUrl}/users/${userId}`, {
      method,
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(request.headers.get("cookie")
          ? { cookie: request.headers.get("cookie")! }
          : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Khong the ket noi toi may chu backend." },
      { status: 503 },
    );
  }

  const rawText = await backendResponse.text();

  return new NextResponse(rawText || null, {
    status: backendResponse.status,
    headers: {
      "content-type":
        backendResponse.headers.get("content-type") ??
        "application/json; charset=utf-8",
    },
  });
}
