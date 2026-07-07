import type { ReactNode } from "react";
import { Box } from "@radix-ui/themes";
import { AdminMobileNav, AdminNavbar, AdminSidebar } from "./layout";
import layoutStyles from "./layout/admin-layout.module.css";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
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
