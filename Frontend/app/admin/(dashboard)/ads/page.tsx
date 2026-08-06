import type { Metadata } from "next";
import { AdsPage } from "@/features/admin/page/AdsPage";

export const metadata: Metadata = {
  title: "Quảng cáo",
  description: "Quản lý quảng cáo và doanh thu trên nền tảng Người Lạ.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminAdsRoute() {
  return <AdsPage />;
}
