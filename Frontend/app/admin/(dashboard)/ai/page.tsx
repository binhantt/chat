import type { Metadata } from "next";
import { AiPage } from "@/features/admin/page";

export const metadata: Metadata = {
  title: "AI Chat | Quản trị Người Lạ",
};

export default function Page() {
  return <AiPage />;
}
