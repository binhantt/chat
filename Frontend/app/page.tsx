"use client";

import { Box, DropdownMenu, Flex, Spinner, Text } from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  ExclamationTriangleIcon,
  GearIcon,
  GlobeIcon,
  MoonIcon,
  PersonIcon,
  StarIcon,
  ExitIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import dynamic from "next/dynamic";
import { Suspense, memo } from "react";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import { useUserTabs } from "@/features/user-layout/hooks/useUserTabs";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { TabId } from "@/components/layouts/users/Sidebar";

// Lazy-load each tab — only fetch JS when tab is first opened
const ChatPage = dynamic(() => import("@/features/chat/page/ChatPage").then((m) => ({ default: m.ChatPage })), {
  loading: () => <CenterSpinner />,
  ssr: false,
});
const WebsiteIntroPage = dynamic(() => import("@/features/introduction/page/WebsiteIntroPage").then((m) => ({ default: m.WebsiteIntroPage })), {
  loading: () => <CenterSpinner />,
  ssr: false,
});
const AboutPage = dynamic(() => import("@/features/introduction/page/AboutPage").then((m) => ({ default: m.AboutPage })), {
  loading: () => <CenterSpinner />,
  ssr: false,
});
const SettingsPage = dynamic(() => import("@/features/settings/page/SettingsPage").then((m) => ({ default: m.SettingsPage })), {
  loading: () => <CenterSpinner />,
  ssr: false,
});
const ReportPage = dynamic(() => import("@/features/report").then((m) => ({ default: m.ReportPage })), {
  loading: () => <CenterSpinner />,
  ssr: false,
});
const VipPage = dynamic(() => import("@/features/vip").then((m) => ({ default: m.VipPage })), {
  loading: () => <CenterSpinner />,
  ssr: false,
});

type NavItemDef = {
  icon: React.ReactNode;
  id: TabId;
  label: string;
};

const navItems: NavItemDef[] = [
  { id: "chat", label: "Trò chuyện", icon: <ChatBubbleIcon width={18} height={18} /> },
  { id: "website", label: "Trang web", icon: <GlobeIcon width={18} height={18} /> },
  { id: "about", label: "Cá nhân", icon: <PersonIcon width={18} height={18} /> },
  { id: "vip", label: "Gói VIP", icon: <StarIcon width={18} height={18} /> },
  { id: "settings", label: "Cài đặt", icon: <GearIcon width={18} height={18} /> },
  { id: "report", label: "Báo cáo", icon: <ExclamationTriangleIcon width={18} height={18} /> },
];

export default function HomePage() {
  const { activeTab, changeTab } = useUserTabs();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const displayName = user?.fullName || user?.email || "Người dùng";
  const initials = getUserInitials(displayName);
  const hasCompleteProfile = !!(user?.gender && user?.city);

  const renderContent = () => {
    if (activeTab === "website") return <WebsiteIntroPage />;
    if (activeTab === "about") return <AboutPage />;
    if (activeTab === "vip") return <VipPage />;
    if (activeTab === "settings") return <SettingsPage />;
    if (activeTab === "report") return <ReportPage />;
    return (
      <Suspense fallback={null}>
        <ChatPage />
      </Suspense>
    );
  };

  return (
    <Flex style={{ height: "100dvh", overflow: "hidden", background: "var(--bg-primary)" }}>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <Flex
        direction="column"
        display={{ initial: "none", md: "flex" }}
        style={{
          background: "var(--bg-sidebar)",
          color: "#FFFFFF",
          width: 256,
          flexShrink: 0,
          height: "100%",
          padding: "20px 14px",
        }}
      >
        {/* Logo */}
        <Flex align="center" gap="3" mb="6" px="2">
          <Flex
            align="center"
            justify="center"
            style={{
              background: "var(--chat-accent-soft)",
              borderRadius: 12,
              color: "var(--secondary-light)",
              height: 38,
              width: 38,
            }}
          >
            <ChatBubbleIcon width={18} height={18} />
          </Flex>
          <Text weight="bold" size="5" style={{ letterSpacing: "0.02em", fontFamily: "var(--font-heading)" }}>
            Người Lạ
          </Text>
        </Flex>

        {/* Nav items */}
        <Flex direction="column" gap="1" style={{ flex: 1 }}>
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changeTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "11px 14px",
                  border: "none",
                  borderRadius: 10,
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.50)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.50)";
                  }
                }}
              >
                <Flex align="center" justify="center" style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.40)", width: 20, height: 20, flexShrink: 0 }}>
                  {item.icon}
                </Flex>
                {item.label}
              </button>
            );
          })}
        </Flex>

        {/* User info */}
        <Flex
          direction="column"
          gap="3"
          px="2"
          py="3"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            marginTop: 8,
          }}
        >
          <Flex align="center" gap="3">
            <AvatarWithVipBadge
              fallback={initials}
              radius="full"
              size="2"
              src={user?.avatarUrl || undefined}
              badge={user?.badge}
              style={{
                background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
                color: "#FFFFFF",
                flexShrink: 0,
              }}
            />
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="2"
                weight="bold"
                style={{
                  color: "#FFFFFF",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {displayName}
              </Text>
              <Text
                size="1"
                style={{
                  color: "rgba(255,255,255,0.50)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {user?.email}
              </Text>
            </Box>
          </Flex>

          {!hasCompleteProfile && (
            <button
              type="button"
              onClick={() => changeTab("about")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "8px 10px",
                border: "none",
                borderRadius: 8,
                background: "rgba(251, 191, 36, 0.15)",
                color: "#fbbf24",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Cập nhật hồ sơ
            </button>
          )}

          <button
            type="button"
            onClick={logout}
            title="Đăng xuất"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              borderRadius: 8,
              color: "rgba(255,255,255,0.30)",
              cursor: "pointer",
              height: 32,
              width: 32,
              padding: 0,
              transition: "all 0.15s ease",
              alignSelf: "flex-end",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--chat-danger)";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.3)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <ExitIcon width={16} height={16} />
          </button>
        </Flex>
      </Flex>

      {/* ===== MAIN CONTENT ===== */}
      <Flex direction="column" style={{ flex: 1, minWidth: 0, height: "100%" }}>
        {/* Navbar */}
        <Flex
          align="center"
          justify="between"
          px={{ initial: "3", sm: "5" }}
          style={{
            background: "var(--bg-navbar)",
            borderBottom: "1px solid var(--border-color)",
            height: 64,
            flexShrink: 0,
          }}
        >
          <Flex align="center" gap={{ initial: "2", sm: "4" }}>
            <Text size={{ initial: "3", sm: "5" }} weight="bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)", lineHeight: 1.2 }}>
              {activeTab === "chat" ? (
                <><span className="navbar-greeting">Xin chào </span><span style={{ color: "var(--primary)" }}>{displayName}</span>!</>
              ) : (
                navItems.find(n => n.id === activeTab)?.label || "Trang chủ"
              )}
            </Text>
          </Flex>

          <Flex align="center" gap={{ initial: "1", sm: "2" }}>
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title="Đổi giao diện"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                borderRadius: 8,
                color: "var(--text-secondary)",
                cursor: "pointer",
                height: 34,
                width: 34,
                padding: 0,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--chat-accent-soft)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {theme === "dark" ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
            </button>

            {/* Avatar + dropdown */}
            {loading ? (
              <Spinner size="2" />
            ) : (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Flex
                    align="center"
                    gap="2"
                    style={{ cursor: "pointer", padding: "4px 8px 4px 4px", borderRadius: 8, transition: "background 0.15s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--chat-accent-soft)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <AvatarWithVipBadge
                      fallback={initials}
                      radius="full"
                      size="2"
                      src={user?.avatarUrl || undefined}
                      badge={user?.badge}
                      style={{
                        background: "linear-gradient(135deg, var(--chat-accent), var(--secondary))",
                        color: "#FFFFFF",
                      }}
                    />
                    <Box display={{ initial: "none", sm: "block" }}>
                      <Text size="2" weight="medium" style={{ color: "var(--text-primary)" }}>
                        {displayName}
                      </Text>
                    </Box>
                  </Flex>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end" sideOffset={8}>
                  <DropdownMenu.Label>
                    <Text size="2" weight="bold" style={{ color: "var(--text-primary)" }}>{displayName}</Text>
                  </DropdownMenu.Label>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item onClick={() => changeTab("about")}>
                    <PersonIcon /> Cá nhân
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => changeTab("settings")}>
                    <GearIcon /> Cài đặt
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item color="red" onClick={logout}>
                    <ExitIcon /> Đăng xuất
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            )}
          </Flex>
        </Flex>

        {/* Content area */}
        <Box
          style={{
            flex: 1,
            minHeight: 0,
            overflow: activeTab === "chat" ? "hidden" : "auto",
            background: activeTab === "chat" ? "var(--chat-bg)" : "var(--bg-primary)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {renderContent()}
        </Box>
      </Flex>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      {hasCompleteProfile && (
      <Flex
        display={{ initial: "flex", md: "none" }}
        justify="between"
        style={{
          background: "var(--bg-sidebar)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "6px 4px calc(6px + env(safe-area-inset-bottom))",
          zIndex: 50,
        }}
      >
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => changeTab(item.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "5px 2px",
                border: "none",
                borderRadius: 8,
                background: active ? "rgba(255,255,255,0.10)" : "transparent",
                color: active ? "#FFFFFF" : "rgba(255,255,255,0.50)",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                minHeight: 48,
              }}
            >
              <Flex align="center" justify="center" style={{ width: 18, height: 18, color: active ? "#FFFFFF" : "rgba(255,255,255,0.50)" }}>
                {item.icon}
              </Flex>
              <Text size="1" style={{ lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", color: "inherit" }}>
                {item.label}
              </Text>
            </button>
          );
        })}
        {/* Logout button */}
        <button
          type="button"
          onClick={logout}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            padding: "5px 2px",
            border: "none",
            borderRadius: 8,
            background: "transparent",
            color: "rgba(255,255,255,0.50)",
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 400,
            minHeight: 48,
          }}
        >
          <Flex align="center" justify="center" style={{ width: 18, height: 18, color: "rgba(255,255,255,0.50)" }}>
            <ExitIcon width={18} height={18} />
          </Flex>
          <Text size="1" style={{ lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", color: "inherit" }}>
            Đăng xuất
          </Text>
        </button>
      </Flex>
      )}
    </Flex>
  );
}

function getUserInitials(name: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CenterSpinner() {
  return (
    <Flex align="center" justify="center" style={{ height: "100%", width: "100%", minHeight: 200 }}>
      <Spinner size="3" />
    </Flex>
  );
}
