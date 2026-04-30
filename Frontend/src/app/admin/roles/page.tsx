import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RolesOverview } from "@/components/admin/roles/RolesOverview";
import { RolesGrid } from "@/components/admin/roles/RolesGrid";

export default async function AdminRolesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!userId || !refreshToken) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen px-4 py-5 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <RolesOverview />
        <RolesGrid />
      </div>
    </main>
  );
}
