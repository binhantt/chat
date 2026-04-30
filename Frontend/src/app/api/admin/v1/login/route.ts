import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export const runtime = "nodejs";

const INVALID_PAYLOAD_MESSAGE = "Du lieu dang nhap khong hop le.";
const BACKEND_UNAVAILABLE_MESSAGE =
  "Khong the ket noi toi may chu xac thuc. Vui long thu lai.";
const MISSING_BACKEND_URL_MESSAGE =
  "Thieu cau hinh BACKEND_URL hoac NEXT_PUBLIC_BACKEND_URL cho frontend proxy.";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: INVALID_PAYLOAD_MESSAGE },
      { status: 400 },
    );
  }

  if (!isLoginPayload(payload)) {
    return NextResponse.json(
      { message: INVALID_PAYLOAD_MESSAGE },
      { status: 400 },
    );
  }

  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return NextResponse.json(
      { message: MISSING_BACKEND_URL_MESSAGE },
      { status: 500 },
    );
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(`${backendUrl}/api/admin/v1/login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
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

  const response = new NextResponse(bodyText || null, {
    status: upstreamResponse.status,
    headers: {
      "content-type": contentType,
    },
  });

  for (const cookie of getSetCookieValues(upstreamResponse.headers)) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

function isLoginPayload(value: unknown): value is {
  email: string;
  password: string;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.email === "string" &&
    payload.email.trim().length > 0 &&
    typeof payload.password === "string" &&
    payload.password.trim().length > 0
  );
}

function getSetCookieValues(headers: Headers): string[] {
  const headersWithGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithGetSetCookie.getSetCookie === "function") {
    return headersWithGetSetCookie.getSetCookie();
  }

  const rawHeader = headers.get("set-cookie");
  return rawHeader ? splitSetCookieHeader(rawHeader) : [];
}

function splitSetCookieHeader(headerValue: string): string[] {
  return headerValue
    .split(/,(?=\s*[^;,=\s]+=)/g)
    .map((value) => value.trim())
    .filter(Boolean);
}
