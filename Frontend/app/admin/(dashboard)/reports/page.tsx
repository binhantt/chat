import type { Metadata } from "next";
import { ReportsPage } from "@/features/admin/page/ReportsPage";

export const metadata: Metadata = {
  title: "Báo cáo vi phạm",
  description: "Xem xét và xử lý các báo cáo vi phạm từ người dùng Người Lạ.",
  robots: { index: false, follow: false },
};

export default function ReportsRoutePage() {
  return <ReportsPage />;
}