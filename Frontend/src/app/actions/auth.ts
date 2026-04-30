"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookiesList = await cookies();
  cookiesList.delete("user_id");
  cookiesList.delete("refresh_token");
  redirect("/admin/login");
}
