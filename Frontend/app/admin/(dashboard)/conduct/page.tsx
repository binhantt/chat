import type { Metadata } from "next";
import { ConductPage } from "@/features/admin/page/ConductPage";

export const metadata: Metadata = {
  title: "Quy tắc ứng xử",
  description: "Thiết lập quy tắc ứng xử và điều khoản sử dụng trên Người Lạ.",
  robots: { index: false, follow: false },
};

export default function ConductRoutePage() {
  return <ConductPage />;
}
