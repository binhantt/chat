"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flex, Text } from "@radix-ui/themes";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { adminNavItems, isActiveAdminPath } from "./adminNavigation";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminSidebar() {
  const s = useAdminStyles();
  const currentPath = usePathname();

  return (
    <Flex direction="column" className={s.sidebar.sidebar}>
      <Flex align="center" gap="3" mb="6" px="2" className={s.sidebar.logoArea}>
        <BrandLogo compact subtitle="Bảng quản trị" />
      </Flex>

      <Flex direction="column" gap="1" className={s.sidebar.navList}>
        {adminNavItems.map((item) => (
          <AdminNavItem
            active={isActiveAdminPath(currentPath, item.href)}
            href={item.href}
            icon={item.icon}
            key={item.href}
            label={item.label}
          />
        ))}
      </Flex>
    </Flex>
  );
}

function AdminNavItem({
  active,
  href,
  icon,
  label,
}: {
  active: boolean;
  href: string;
  icon: ReactNode;
  label: string;
}) {
  const s = useAdminStyles();
  return (
    <Link
      aria-current={active ? "page" : undefined}
      href={href}
      prefetch={false}
      className={s.sidebar.navLink}
    >
      <Flex
        align="center"
        gap="3"
        px="3"
        py="2"
        className={`${s.sidebar.navItem} ${active ? s.sidebar.navItemActive : s.sidebar.navItemInactive}`}
      >
        <Flex
          align="center"
          justify="center"
          className={`${s.sidebar.navIconBox} ${active ? s.sidebar.navIconActive : s.sidebar.navIconInactive}`}
        >
          {icon}
        </Flex>
        <Text size="2" style={{ color: "inherit", fontWeight: active ? 600 : 400 }}>
          {label}
        </Text>
      </Flex>
    </Link>
  );
}
