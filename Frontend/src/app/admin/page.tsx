import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminMetrics } from "@/components/admin/AdminMetrics";
import { AdminActivity } from "@/components/admin/AdminActivity";
import { SystemHealth } from "@/components/admin/SystemHealth";
import { AdminChart } from "@/components/admin/AdminChart";

export default async function AdminHomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!userId || !refreshToken) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen px-4 py-5 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        
        {/* Component 1: Top Banner and Session Info */}
        <AdminOverview userId={userId} />

        {/* Component 2: Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <AdminMetrics />
        </div>

        {/* Component 3: Responsive Chart Area */}
        <div className="w-full">
          <AdminChart />
        </div>

        {/* Component 4: Layout Grid for Activity and Health */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
          <AdminActivity />
          <SystemHealth />
        </div>
        
      </div>
    </main>
  );
}
