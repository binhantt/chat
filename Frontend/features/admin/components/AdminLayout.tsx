"use client";

import { Box } from "@radix-ui/themes";
import { AdminNavbar } from "../../../components/layouts/admin/AdminNavbar";
import { AdminSidebar } from "../../../components/layouts/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box style={{ minHeight: "100vh", background: "var(--gray-1)" }}>
      <AdminSidebar />
      <AdminNavbar />
      <Box
        style={{
          marginLeft: 260,
          padding: "84px 24px 24px",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
