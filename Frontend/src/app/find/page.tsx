import { redirect } from "next/navigation";
import { AppLayout } from "@/features/layout/user";
import { FindPage } from "@/features/find";
import { hasAuthenticatedSession } from "@/lib/auth-session";

export default async function FindStrangerPage() {
  if (!(await hasAuthenticatedSession())) {
    redirect("/login");
  }

  return (
    <AppLayout>
      <FindPage />
    </AppLayout>
  );
}
