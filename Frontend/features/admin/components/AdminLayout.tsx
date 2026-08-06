"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Text, Flex, Spinner } from "@radix-ui/themes";
import { AdminMobileNav, AdminNavbar, AdminSidebar } from "./layout";
import layoutStyles from "./layout/admin-layout.module.css";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [adminCheck, setAdminCheck] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    fetch("/api/v1/users/me", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          setAdminCheck("denied");
          return;
        }
        const user = await r.json().catch(() => null);
        if (user?.isAdmin) {
          setAdminCheck("ok");
        } else {
          setAdminCheck("denied");
        }
      })
      .catch(() => setAdminCheck("denied"));
  }, []);

  if (adminCheck === "loading") {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spinner size="3" />
      </Flex>
    );
  }

  if (adminCheck === "denied") {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Box style={{ textAlign: "center" }}>
          <Text size="5" weight="bold" style={{ color: "var(--color-text)" }}>
            Bạn không có quyền truy cập trang quản trị
          </Text>
          <Text size="2" style={{ color: "var(--color-muted)", marginTop: 8, display: "block" }}>
            Vui lòng đăng nhập bằng tài khoản Admin.
          </Text>
          <button
            onClick={() => router.replace("/admin/login")}
            style={{
              marginTop: 16,
              padding: "8px 24px",
              borderRadius: 8,
              background: "var(--color-accent)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Đăng nhập lại
          </button>
        </Box>
      </Flex>
    );
  }

  return (
    <Box className={layoutStyles.root}>
      <Box className={layoutStyles.inner} style={{ display: "flex" }}>
        <AdminSidebar />
        <Box className={layoutStyles.contentColumn} style={{ display: "flex", flexDirection: "column" }}>
          <AdminNavbar />
          <Box asChild className={layoutStyles.main}>
            <main>{children}</main>
          </Box>
          <AdminMobileNav />
        </Box>
      </Box>
    </Box>
  );
}
