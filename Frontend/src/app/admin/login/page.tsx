import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthPage } from "@/features/auth";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const hasSession =
    Boolean(cookieStore.get("refresh_token")?.value) &&
    Boolean(cookieStore.get("user_id")?.value);

  if (hasSession) {
    redirect("/admin");
  }

  return <AuthPage />;
}
