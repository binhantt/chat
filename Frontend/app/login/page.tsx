import type { Metadata } from "next";
import { LoginPage } from "@/features/athu/page/LoginPage";

export const metadata: Metadata = {
  title: "Đăng Nhập Chat Người Lạ Online | Người Lạ",
  description: "Đăng nhập để chat người lạ online miễn phí. Kết nối nhanh, ghép đôi thông minh, trò chuyện ẩn danh an toàn. Đăng nhập bằng Google hoặc chọn ẩn danh.",
  keywords: [
    "đăng nhập Người Lạ",
    "chat người lạ",
    "đăng nhập chat online",
    "trò chuyện ẩn danh",
    "chat miễn phí",
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Đăng Nhập Chat Người Lạ Online | Người Lạ",
    description: "Đăng nhập để chat người lạ online miễn phí. Kết nối nhanh, an toàn, riêng tư.",
    url: "/login",
  },
};

export default function Page() {
  return <LoginPage />;
}
