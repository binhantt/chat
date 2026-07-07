import type { Metadata } from "next";
import { AdminLoginPage } from "@/features/admin/login";

export const metadata: Metadata = {
  title: "Quản trị - Đăng nhập",
  description: "Đăng nhập vào trang quản trị của Người Lạ.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/admin/login",
  },
};

export default function AdminLoginRoute() {
  return <AdminLoginPage />;
}
