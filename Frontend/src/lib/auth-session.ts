import { cookies } from "next/headers";

export async function hasAuthenticatedSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  return Boolean(userId && (accessToken || refreshToken));
}

export async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!userId || (!accessToken && !refreshToken)) {
    return null;
  }

  return userId;
}
