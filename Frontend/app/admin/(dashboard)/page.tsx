import type { Metadata } from "next";
import { DashboardPage } from "@/features/admin/page/DashboardPage";

export const metadata: Metadata = {
  title: "Tổng quan",
  description: "Bảng điều khiển quản trị Người Lạ — theo dõi số liệu người dùng, lượt trò chuyện và báo cáo.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardRoute() {
  return <DashboardPage />;
}
