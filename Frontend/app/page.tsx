"use client";

import { Flex, Box } from "@radix-ui/themes";
import { Suspense } from "react";
import { Navbar } from "@/components/layouts/users/Navbar";
import { Sidebar, UserMobileNav } from "@/components/layouts/users/Sidebar";
import { AboutPage } from "@/features/introduction/page/AboutPage";
import { WebsiteIntroPage } from "@/features/introduction/page/WebsiteIntroPage";
import { SettingsPage } from "@/features/settings/page/SettingsPage";
import { ChatPage } from "@/features/chat/page/ChatPage";
import { ReportPage } from "@/features/report";
import { VipPage } from "@/features/vip";
import { authTheme } from "@/features/athu/styles/authTheme";
import { useUserTabs } from "@/features/user-layout/hooks/useUserTabs";

export default function HomePage() {
  const { activeTab, changeTab } = useUserTabs();

  const renderActiveTab = () => {
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
    <Box style={{ background: authTheme.background, height: "100dvh" }}>
      <Flex
        direction="column"
        style={{
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Navbar />
        <Flex style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
          <Sidebar activeTab={activeTab} onTabChange={changeTab} />
          <Flex
            style={{
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              overflow: "hidden",
              background:
                activeTab === "chat"
                  ? "var(--chat-bg)"
                  : `radial-gradient(circle at 82% 12%, rgba(34, 211, 238, 0.12), transparent 24%), ${authTheme.background}`,
              padding: activeTab === "chat" ? 0 : 0,
            }}
          >
            <Box
              style={{
                width: "100%",
                height: "100%",
                minHeight: 0,
                minWidth: 0,
                overflowX: "hidden",
                overflowY: activeTab === "chat" ? "hidden" : "auto",
                paddingBottom: activeTab === "chat" ? 0 : 76,
                background: "transparent",
                border: "none",
                borderRadius: 0,
              }}
            >
              {renderActiveTab()}
            </Box>
          </Flex>
        </Flex>
        <UserMobileNav activeTab={activeTab} onTabChange={changeTab} />
      </Flex>
    </Box>
  );
}
