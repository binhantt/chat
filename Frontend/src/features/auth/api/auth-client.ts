import type { AdminLoginPayload, AdminLoginResponse, GoogleLoginPayload, GoogleLoginResponse } from "../types";

export class AuthRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthRequestError";
  }
}

export async function emailLogin(
  payload: AdminLoginPayload,
): Promise<AdminLoginResponse> {
  let response: Response;

  try {
    response = await fetch("/api/admin/v1/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "same-origin",
    });
  } catch {
    throw new AuthRequestError(
      "Khong the ket noi toi may chu xac thuc. Vui long thu lai.",
      0,
    );
  }

  const payloadData = await parseResponse(response);

  if (!response.ok) {
    throw new AuthRequestError(
      getErrorMessage(payloadData, response.status),
      response.status,
    );
  }

  return payloadData as AdminLoginResponse;
}

export async function googleLogin(
  payload: GoogleLoginPayload,
): Promise<GoogleLoginResponse> {
  let response: Response;

  try {
    response = await fetch("/api/auth/google-login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "same-origin",
    });
  } catch {
    throw new AuthRequestError(
      "Không thể kết nối tới máy chủ. Vui lòng thử lại.",
      0,
    );
  }

  const payloadData = await parseResponse(response);

  if (!response.ok) {
    throw new AuthRequestError(
      getErrorMessage(payloadData, response.status),
      response.status,
    );
  }

  return payloadData as GoogleLoginResponse;
}

async function parseResponse(response: Response): Promise<unknown> {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as unknown;
  } catch {
    return { message: rawText };
  }
}

function getErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  if (status >= 500) {
    return "May chu xac thuc dang ban. Vui long thu lai sau.";
  }

  return "Dang nhap chua thanh cong. Vui long kiem tra lai thong tin.";
}
