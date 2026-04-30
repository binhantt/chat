import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserManagementOverview } from "@/components/admin/users/UserManagementOverview";
import { UserManagementStats } from "@/components/admin/users/UserManagementStats";
import { UserManagementTable } from "@/components/admin/users/UserManagementTable";
import { fetchAdminUsers } from "@/lib/admin-users";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!userId || !refreshToken) {
    redirect("/admin/login");
  }

  const users = await fetchAdminUsers();

  return (
    <main className="min-h-screen px-4 py-5 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <UserManagementOverview users={users} />

        <div className="grid gap-4 md:grid-cols-3">
          <UserManagementStats />
        </div>

        <UserManagementTable users={users} />
      </div>
    </main>
  );
}
