import { DashboardPage } from "@/features/admin/page/DashboardPage";

export const dynamic = "force-dynamic";

export default async function AdminDashboardRoute() {
  return <DashboardPage />;
}
