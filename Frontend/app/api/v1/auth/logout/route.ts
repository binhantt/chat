import { NextResponse } from "next/server";

const authCookies = ["access_token", "refresh_token", "user_id", "csrf_token"];

export async function POST() {
  const response = NextResponse.json({ success: true });

  for (const name of authCookies) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: name !== "user_id" && name !== "csrf_token",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}
