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
        background: "var(--bg-sidebar)",
        borderRight: `1px solid rgba(255,255,255,0.08)`,
        color: "#FFFFFF",
        height: "100%",
        width: 232,
      }}
    >
      <Text size="1" style={{ color: "rgba(255,255,255,0.5)", padding: "6px 10px" }}>
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
          background: "rgba(255,255,255,0.06)",
          border: `1px solid rgba(255,255,255,0.10)`,
          borderRadius: 8,
          padding: 12,
        }}
      >
        <BrandLogo compact />
        <Text as="div" size="1" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginTop: 8 }}>
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
        background: "var(--bg-sidebar)",
        borderTop: `1px solid rgba(255,255,255,0.08)`,
        bottom: 0,
        boxShadow: "0 -12px 32px rgba(15, 23, 42, 0.3)",
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
              color: active ? "#FFFFFF" : "rgba(255,255,255,0.50)",
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
                background: active ? "rgba(255,255,255,0.10)" : "transparent",
                border: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                borderRadius: 8,
                minHeight: 54,
                padding: "6px 4px",
              }}
            >
              <Flex
                align="center"
                justify="center"
                style={{
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.50)",
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
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.50)",
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
        background: active ? "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(165,139,217,0.15))" : "transparent",
        border: active ? `1px solid rgba(255,255,255,0.15)` : "1px solid transparent",
        borderRadius: 8,
        color: active ? "#FFFFFF" : "rgba(255,255,255,0.60)",
        cursor: "pointer",
        minHeight: 46,
      }}
    >
      <Flex align="center" justify="center" style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.60)", height: 20, width: 20 }}>
        {icon}
      </Flex>
      <Text size="2" weight={active ? "bold" : "medium"} style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.60)" }}>
        {label}
      </Text>
    </Flex>
  );
}
