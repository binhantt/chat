import type { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { AdminMobileNav, AdminNavbar, AdminSidebar } from "./layout";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box
      style={{
        background: `radial-gradient(circle at 90% 8%, rgba(34, 211, 238, 0.12), transparent 24%), ${authTheme.background}`,
        color: authTheme.text,
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <Flex style={{ height: "100%", minHeight: 0 }}>
        <AdminSidebar />
        <Flex direction="column" style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
          <AdminNavbar />
          <Box
            asChild
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              padding: "18px clamp(12px, 2vw, 28px) 92px",
            }}
          >
            <main>{children}</main>
          </Box>
          <AdminMobileNav />
        </Flex>
      </Flex>
    </Box>
  );
}
