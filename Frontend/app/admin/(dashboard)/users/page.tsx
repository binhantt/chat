import type { Metadata } from "next";
import { UsersPage } from "@/features/admin/page";

export const metadata: Metadata = {
  title: "Quản lý người dùng",
  description: "Quản lý tài khoản người dùng — xem hồ sơ, khóa/mở khóa và theo dõi hoạt động trên Người Lạ.",
  robots: { index: false, follow: false },
};

export default function UsersRoute() {
  return <UsersPage />;
}