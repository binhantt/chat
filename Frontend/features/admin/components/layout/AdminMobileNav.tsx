"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { adminNavItems, isActiveAdminPath } from "./adminNavigation";

export function AdminMobileNav() {
  const currentPath = usePathname();

  return (
    <Flex
      display={{ initial: "flex", md: "none" }}
      gap="1"
      style={{
        background: authTheme.panel,
        borderTop: `1px solid ${authTheme.line}`,
        bottom: 0,
        boxShadow: "0 -12px 32px rgba(15, 23, 42, 0.08)",
        left: 0,
        overflowX: "auto",
        padding: "8px 10px calc(8px + env(safe-area-inset-bottom))",
        position: "fixed",
        right: 0,
        zIndex: 50,
      }}
    >
      {adminNavItems.map((item) => {
        const active = isActiveAdminPath(currentPath, item.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            href={item.href}
            key={item.href}
            prefetch={false}
            style={{
              color: active ? authTheme.text : authTheme.muted,
              flex: "0 0 76px",
              textDecoration: "none",
            }}
          >
            <Flex
              align="center"
              direction="column"
              gap="1"
              justify="center"
              style={{
                background: active ? "var(--auth-soft-control)" : "transparent",
                border: active ? `1px solid ${authTheme.line}` : "1px solid transparent",
                borderRadius: 8,
                minHeight: 54,
                padding: "6px 4px",
              }}
            >
              <Flex
                align="center"
                justify="center"
                style={{
                  color: active ? authTheme.control : authTheme.muted,
                  height: 18,
                  width: 18,
                }}
              >
                {item.icon}
              </Flex>
              <Text
                align="center"
                size="1"
                weight={active ? "bold" : "medium"}
                style={{
                  lineHeight: 1.1,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Text>
            </Flex>
          </Link>
        );
      })}
    </Flex>
  );
}
