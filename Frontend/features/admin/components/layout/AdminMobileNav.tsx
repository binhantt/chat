"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flex, Text } from "@radix-ui/themes";
import { adminNavItems, isActiveAdminPath } from "./adminNavigation";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminMobileNav() {
  const s = useAdminStyles();
  const currentPath = usePathname();

  return (
    <Flex gap="1" className={s.mobileNav.mobileNav}>
      {adminNavItems.map((item) => {
        const active = isActiveAdminPath(currentPath, item.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            href={item.href}
            key={item.href}
            prefetch={false}
            className={`${s.mobileNav.navLink} ${active ? s.mobileNav.navLinkActive : s.mobileNav.navLinkInactive}`}
          >
            <Flex
              align="center"
              direction="column"
              gap="1"
              justify="center"
              className={`${s.mobileNav.navItem} ${active ? s.mobileNav.navItemActive : s.mobileNav.navItemInactive}`}
            >
              <Flex align="center" justify="center" className={s.mobileNav.iconBox}
                style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.50)" }}>
                {item.icon}
              </Flex>
              <Text
                align="center"
                size="1"
                weight={active ? "bold" : "medium"}
                className={s.mobileNav.label}
                style={{ color: "inherit" }}
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
