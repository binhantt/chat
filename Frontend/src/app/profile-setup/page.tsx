import { redirect } from "next/navigation";
import { AppLayout } from "@/features/layout/user";
import { ProfileSetupForm } from "@/features/profile";
import { hasAuthenticatedSession } from "@/lib/auth-session";

export default async function ProfileSetupPage() {
  if (!(await hasAuthenticatedSession())) {
    redirect("/login");
  }

  return (
    <AppLayout>
      <ProfileSetupForm />
    </AppLayout>
  );
}
