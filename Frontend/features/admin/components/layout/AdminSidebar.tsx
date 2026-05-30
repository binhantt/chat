"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flex, Text } from "@radix-ui/themes";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { authTheme } from "@/features/athu/styles/authTheme";
import { adminNavItems, isActiveAdminPath } from "./adminNavigation";

export function AdminSidebar() {
  const currentPath = usePathname();

  return (
    <Flex
      direction="column"
      display={{ initial: "none", md: "flex" }}
      style={{
        background: authTheme.panel,
        borderRight: `1px solid ${authTheme.line}`,
        flexShrink: 0,
        height: "100%",
        width: 248,
      }}
    >
      <Flex align="center" gap="3" p="4" style={{ borderBottom: `1px solid ${authTheme.line}` }}>
        <BrandLogo compact subtitle="Bảng quản trị" />
      </Flex>

      <Flex direction="column" gap="2" p="3" style={{ flex: 1 }}>
        <Text size="1" style={{ color: authTheme.muted, padding: "6px 10px" }}>
          Menu
        </Text>
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
  return (
    <Link
      aria-current={active ? "page" : undefined}
      href={href}
      prefetch={false}
      style={{
        color: active ? authTheme.text : authTheme.muted,
        textDecoration: "none",
      }}
    >
      <Flex
        align="center"
        gap="3"
        px="3"
        py="2"
        style={{
          background: active
            ? "linear-gradient(135deg, rgba(59,130,246,0.16), rgba(34,211,238,0.12))"
            : "transparent",
          border: active ? `1px solid ${authTheme.line}` : "1px solid transparent",
          borderRadius: 8,
          cursor: "pointer",
          minHeight: 46,
        }}
      >
        <Flex
          align="center"
          justify="center"
          style={{
            color: active ? authTheme.control : authTheme.muted,
            height: 20,
            width: 20,
          }}
        >
          {icon}
        </Flex>
        <Text size="2" weight={active ? "bold" : "medium"}>
          {label}
        </Text>
      </Flex>
    </Link>
  );
}
