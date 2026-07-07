import type { Metadata } from "next";
import { LoginPage } from "@/features/athu/page/LoginPage";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập bằng tài khoản Google để bắt đầu trò chuyện và kết nối với mọi người trên Người Lạ.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Đăng nhập",
    description: "Đăng nhập bằng tài khoản Google để bắt đầu trò chuyện và kết nối với mọi người.",
    url: "/login",
  },
};

export default function Page() {
  return <LoginPage />;
}
