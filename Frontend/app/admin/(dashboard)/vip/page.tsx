import type { Metadata } from "next";
import { VipPackagesPage } from "@/features/admin/page";

export const metadata: Metadata = {
  title: "Gói VIP",
  description: "Quản lý gói VIP, giá cả và quyền lợi dành cho người dùng Người Lạ.",
  robots: { index: false, follow: false },
};

export default function VipRoutePage() {
  return <VipPackagesPage />;
}
