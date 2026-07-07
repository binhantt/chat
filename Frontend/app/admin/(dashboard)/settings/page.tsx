import type { Metadata } from "next";
import { SettingsPage } from "@/features/admin/page/SettingsPage";

export const metadata: Metadata = {
  title: "Cài đặt hệ thống",
  description: "Cấu hình hệ thống Người Lạ — bảo mật, thông báo và các tùy chỉnh chung.",
  robots: { index: false, follow: false },
};

export default function SettingsRoutePage() {
  return <SettingsPage />;
}