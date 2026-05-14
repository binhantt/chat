"use client";

import { Box, Flex, Text } from "@radix-ui/themes";

export type TabId = "chat" | "website" | "about" | "vip" | "settings" | "report";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "chat",
    label: "Chat",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "website",
    label: "Giới thiệu website",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 0 20" />
        <path d="M12 2a15.3 15.3 0 0 0 0 20" />
      </svg>
    ),
  },
  {
    id: "about",
    label: "Giới thiệu bản thân",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "vip",
    label: "Gói VIP",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: "report",
    label: "Báo cáo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

const primaryNavItems = navItems.filter((item) => item.id === "chat");
const secondaryNavItems = navItems.filter((item) => item.id !== "chat");

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <Flex
      display={{ initial: "none", md: "flex" }}
      direction="column"
      gap="3"
      px="3"
      className="chat-app-sidebar"
      data-sidebar
      style={{
        width: 240,
        height: "100%",
        background: "var(--indigo-2)",
        borderRight: "1px solid var(--indigo-5)",
        paddingTop: 8,
      }}
    >
      {primaryNavItems.map((item) => (
        <NavItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={activeTab === item.id}
          onClick={() => onTabChange(item.id)}
        />
      ))}

      <Box
        style={{
          height: 1,
          background: "var(--indigo-5)",
          margin: "4px 0",
        }}
      />

      <details open={activeTab !== "chat"}>
        <summary
          style={{
            listStyle: "none",
            cursor: "pointer",
            padding: "8px 12px",
            color: "var(--gray-11)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Menu phu
        </summary>
        <Flex direction="column" gap="1" mt="1">
          {secondaryNavItems.map((item) => (
            <NavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </Flex>
      </details>
    </Flex>
  );
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <Flex
      align="center"
      gap="3"
      px="3"
      py="2"
      onClick={onClick}
      style={{
        borderRadius: "var(--radius-2)",
        cursor: "pointer",
        background: active ? "var(--indigo-4)" : "transparent",
        color: active ? "var(--indigo-11)" : "var(--gray-11)",
        transition: "background 0.15s",
      }}
    >
      {icon}
      <Text size="3" weight={active ? "medium" : "regular"}>
        {label}
      </Text>
    </Flex>
  );
}
