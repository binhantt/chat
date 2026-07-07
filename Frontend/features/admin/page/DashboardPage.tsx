import { cookies } from "next/headers";
import type { AdminUser } from "@/features/athu";
import { AdminDashboardView, type AdminDashboardStats } from "@/features/admin/components/dashboard";

import { BACKEND_URL } from "@/lib/env";

export async function DashboardPage() {
  const { error, users } = await getDashboardUsers();
  const stats: AdminDashboardStats = {
    active: users.filter((user) => user.isActive).length,
    banned: users.filter((user) => !user.isActive).length,
    total: users.length,
  };

  return <AdminDashboardView error={error} recentUsers={users.slice(0, 6)} stats={stats} />;
}

async function getDashboardUsers(): Promise<{ error: string | null; users: AdminUser[] }> {
  try {
    const cookieHeader = (await cookies())
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    const res = await fetch(`${BACKEND_URL}/api/v1/manager/users?limit=20`, {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      return { error: "Cannot fetch dashboard data", users: [] };
    }

    const data: unknown = await res.json();
    if (Array.isArray(data)) {
      return { error: null, users: data as AdminUser[] };
    }
    const page = data as { items?: AdminUser[] };
    return { error: null, users: Array.isArray(page.items) ? page.items : [] };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { error: "Cannot fetch dashboard data", users: [] };
  }
}
