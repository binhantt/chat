"use client";

import type { ReactNode } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  ExclamationTriangleIcon,
  GearIcon,
  GlobeIcon,
  PersonIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { authTheme } from "@/features/athu/styles/authTheme";

export type TabId = "chat" | "website" | "about" | "vip" | "settings" | "report";

type UserNavItem = {
  icon: ReactNode;
  id: TabId;
  label: string;
};

type NavItemProps = {
  active?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

type SidebarProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

export const userNavItems: UserNavItem[] = [
  { id: "chat", label: "Trò chuyện", icon: <ChatBubbleIcon /> },
  { id: "website", label: "Trang web", icon: <GlobeIcon /> },
  { id: "about", label: "Cá nhân", icon: <PersonIcon /> },
  { id: "vip", label: "Gói VIP", icon: <StarIcon /> },
  { id: "settings", label: "Cài đặt", icon: <GearIcon /> },
  { id: "report", label: "Báo cáo", icon: <ExclamationTriangleIcon /> },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <Flex
      className="chat-app-sidebar"
      data-sidebar
      direction="column"
      display={{ initial: "none", md: "flex" }}
      gap="2"
      p="3"
      style={{
        background: authTheme.panel,
        borderRight: `1px solid ${authTheme.line}`,
        color: authTheme.text,
        height: "100%",
        width: 232,
      }}
    >
      <Text size="1" style={{ color: authTheme.muted, padding: "6px 10px" }}>
        Menu
      </Text>
      {userNavItems.map((item) => (
        <NavItem
          active={activeTab === item.id}
          icon={item.icon}
          key={item.id}
          label={item.label}
          onClick={() => onTabChange(item.id)}
        />
      ))}
      <Box style={{ flex: 1 }} />
      <Box
        style={{
          background: "var(--auth-soft-control)",
          border: `1px solid ${authTheme.line}`,
          borderRadius: 8,
          padding: 12,
        }}
      >
        <BrandLogo compact />
        <Text as="div" size="1" style={{ color: authTheme.muted, lineHeight: 1.5, marginTop: 8 }}>
          Kết nối, trò chuyện và bảo vệ trải nghiệm của bạn.
        </Text>
      </Box>
    </Flex>
  );
}

export function UserMobileNav({ activeTab, onTabChange }: SidebarProps) {
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
      {userNavItems.map((item) => {
        const active = activeTab === item.id;

        return (
          <button
            aria-current={active ? "page" : undefined}
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              appearance: "none",
              background: "transparent",
              border: 0,
              color: active ? authTheme.text : authTheme.muted,
              cursor: "pointer",
              flex: "0 0 76px",
              padding: 0,
            }}
            type="button"
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
          </button>
        );
      })}
    </Flex>
  );
}

function NavItem({ active, icon, label, onClick }: NavItemProps) {
  return (
    <Flex
      align="center"
      gap="3"
      onClick={onClick}
      px="3"
      py="2"
      style={{
        background: active ? "linear-gradient(135deg, rgba(59,130,246,0.16), rgba(34,211,238,0.12))" : "transparent",
        border: active ? `1px solid ${authTheme.line}` : "1px solid transparent",
        borderRadius: 8,
        color: active ? authTheme.text : authTheme.muted,
        cursor: "pointer",
        minHeight: 46,
      }}
    >
      <Flex align="center" justify="center" style={{ color: active ? authTheme.control : authTheme.muted, height: 20, width: 20 }}>
        {icon}
      </Flex>
      <Text size="2" weight={active ? "bold" : "medium"}>
        {label}
      </Text>
    </Flex>
  );
}
