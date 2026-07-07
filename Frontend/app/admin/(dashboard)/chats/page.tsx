import type { Metadata } from "next";
import { ChatsPage } from "@/features/admin/page/ChatsPage";

export const metadata: Metadata = {
  title: "Quản lý trò chuyện",
  description: "Giám sát và quản lý các cuộc trò chuyện trên nền tảng Người Lạ.",
  robots: { index: false, follow: false },
};

export default function ChatsRoutePage() {
  return <ChatsPage />;
}