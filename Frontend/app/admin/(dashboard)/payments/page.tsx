import type { Metadata } from "next";
import { PaymentsPage } from "@/features/admin/page/PaymentsPage";

export const metadata: Metadata = {
  title: "Thanh toán",
  description: "Quản lý giao dịch thanh toán và lịch sử mua gói VIP trên Người Lạ.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPaymentsRoute() {
  return <PaymentsPage />;
}
