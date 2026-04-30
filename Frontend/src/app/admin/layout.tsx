"use client";

import { usePathname } from "next/navigation";
import { AdminNavbar, AdminSidebar } from "@/features/layout/admin/components";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.24),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.18),_transparent_24%),linear-gradient(180deg,_#f8fbff_0%,_#eef5fb_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
      <AdminSidebar />
      <div className="relative flex min-h-screen flex-col lg:pl-72">
        <AdminNavbar />
        <main className="flex flex-1 flex-col overflow-auto pt-24">
          {children}
        </main>
      </div>
    </div>
  );
}
