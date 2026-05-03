import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/backend-url";

export const runtime = "nodejs";

/**
 * POST /api/auth/google-login
 *
 * Proxy sang backend POST /auth/google-login
 * Body: { idToken: string }
 *
 * Backend hiện tại hỗ trợ demo token dạng:
 *   demo:<googleId>:<email>:<fullName>
 *
 * Backend sẽ set cookie access_token, refresh_token, user_id
 * và trả về { message, accessToken, refreshToken, user }.
 */
export async function POST(request: NextRequest) {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return NextResponse.json(
      { message: "Máy chủ backend chưa được cấu hình." },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 },
    );
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${backendUrl}/auth/google-login`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        // forward cookies nếu có để backend có thể dùng
        ...(request.headers.get("cookie")
          ? { cookie: request.headers.get("cookie")! }
          : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Không thể kết nối tới máy chủ backend. Vui lòng thử lại." },
      { status: 503 },
    );
  }

  const rawText = await backendResponse.text();

  let data: unknown;

  try {
    data = JSON.parse(rawText);
  } catch {
    data = { message: rawText };
  }

  // Build response với cùng status code của backend
  const nextResponse = NextResponse.json(data, {
    status: backendResponse.status,
  });

  // Forward Set-Cookie headers từ backend (access_token, refresh_token, user_id)
  backendResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      nextResponse.headers.append("set-cookie", value);
    }
  });

  return nextResponse;
}
