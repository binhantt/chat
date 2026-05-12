"use client";

import { Flex, Text, Box, Avatar } from "@radix-ui/themes";
import {
  DashboardIcon,
  PersonIcon,
  ChatBubbleIcon,
  FileTextIcon,
  GearIcon,
  CaretRightIcon,
  LockClosedIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Tổng quan", icon: <DashboardIcon width={20} height={20} />, href: "/admin" },
  { label: "Người dùng", icon: <PersonIcon width={20} height={20} />, href: "/admin/users" },
  { label: "Tin nhắn", icon: <ChatBubbleIcon width={20} height={20} />, href: "/admin/chats" },
  { label: "Ứng xử", icon: <LockClosedIcon width={20} height={20} />, href: "/admin/conduct" },
  { label: "Báo cáo", icon: <FileTextIcon width={20} height={20} />, href: "/admin/reports" },
  { label: "Gói VIP", icon: <StarIcon width={20} height={20} />, href: "/admin/vip" },
  { label: "Cài đặt", icon: <GearIcon width={20} height={20} />, href: "/admin/settings" },
];

function getActiveHref(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") return "/admin";
  if (pathname.startsWith("/admin/users")) return "/admin/users";
  if (pathname.startsWith("/admin/chats")) return "/admin/chats";
  if (pathname.startsWith("/admin/conduct")) return "/admin/conduct";
  if (pathname.startsWith("/admin/reports")) return "/admin/reports";
  if (pathname.startsWith("/admin/vip")) return "/admin/vip";
  if (pathname.startsWith("/admin/settings")) return "/admin/settings";
  if (pathname.startsWith("/admin/profile")) return "/admin/profile";
  return "/admin";
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string>("/admin");

  useEffect(() => {
    setActiveItem(getActiveHref(pathname));
  }, [pathname]);

  return (
    <Flex
      direction="column"
      style={{
        width: 260,
        height: "100vh",
        background: "var(--indigo-2)",
        borderRight: "1px solid var(--indigo-5)",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      {/* Logo */}
      <Flex align="center" gap="3" p="5" style={{ borderBottom: "1px solid var(--indigo-5)" }}>
        <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="48" height="40" rx="12" fill="url(#admGrad)" />
          <path d="M8 44 L16 52 L24 44" fill="url(#admGrad)" />
          <circle cx="20" cy="18" r="6" fill="white" fillOpacity="0.95" />
          <path d="M10 36 C10 30 15 28 20 28 C25 28 30 30 30 36" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.95" />
          <circle cx="40" cy="16" r="5" fill="white" fillOpacity="0.8" />
          <path d="M31 32 C31 27 35 25 40 25 C45 25 49 27 49 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
          <defs>
            <linearGradient id="admGrad" x1="4" y1="4" x2="52" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        <Flex direction="column">
          <Text size="3" weight="bold" color="indigo">ChatApp</Text>
          <Text size="1" color="indigo" style={{ opacity: 0.7 }}>Admin Panel</Text>
        </Flex>
      </Flex>

      {/* Navigation */}
      <Flex direction="column" p="4" gap="1" style={{ flex: 1 }}>
        <Text size="2" weight="medium" color="indigo" style={{ marginBottom: 8, paddingLeft: 8, opacity: 0.7 }}>
          MENU
        </Text>
        {navItems.map((item) => (
          <Flex
            key={item.href}
            align="center"
            gap="3"
            p="3"
            pl="4"
            style={{
              borderRadius: 8,
              cursor: "pointer",
              background: activeItem === item.href ? "var(--indigo-4)" : "transparent",
              color: activeItem === item.href ? "var(--indigo-11)" : "var(--gray-11)",
              transition: "all 0.15s",
            }}
            onClick={() => {
              setActiveItem(item.href);
              window.location.href = item.href;
            }}
            onMouseEnter={(e) => {
              if (activeItem !== item.href) {
                e.currentTarget.style.background = "var(--indigo-3)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeItem !== item.href) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <Box style={{ color: activeItem === item.href ? "var(--indigo-9)" : "var(--gray-10)" }}>
              {item.icon}
            </Box>
            <Text size="3" weight={activeItem === item.href ? "medium" : "regular"}>
              {item.label}
            </Text>
            {activeItem === item.href && (
              <Box
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--indigo-9)",
                  marginLeft: "auto",
                }}
              />
            )}
          </Flex>
        ))}
      </Flex>

      {/* Admin Profile */}
      <Flex
        align="center"
        gap="3"
        p="4"
        style={{
          borderTop: "1px solid var(--indigo-5)",
          cursor: "pointer",
        }}
        onClick={() => window.location.href = "/admin/profile"}
      >
        <Avatar size="3" fallback="AD" color="indigo" />
        <Flex direction="column" style={{ flex: 1 }}>
          <Text size="2" weight="medium" color="gray" highContrast>Admin User</Text>
          <Text size="1" color="gray">admin@chatapp.com</Text>
        </Flex>
        <CaretRightIcon width={16} height={16} color="var(--gray-9)" />
      </Flex>
    </Flex>
  );
}
