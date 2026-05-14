"use client";

import { Flex, Box } from "@radix-ui/themes";
import { Suspense, useEffect, useState } from "react";
import { Navbar } from "@/components/layouts/users/Navbar";
import { Sidebar, TabId } from "@/components/layouts/users/Sidebar";
import { AboutPage } from "@/features/introduction/page/AboutPage";
import { WebsiteIntroPage } from "@/features/introduction/page/WebsiteIntroPage";
import { SettingsPage } from "@/features/settings/page/SettingsPage";
import { ChatPage } from "@/features/chat/page/ChatPage";
import { ReportPage } from "@/features/report";
import { VipPage } from "@/features/vip";

const tabIds: TabId[] = ["chat", "website", "about", "vip", "settings", "report"];

function isTabId(value: string | null): value is TabId {
  return !!value && tabIds.includes(value as TabId);
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");

    if (isTabId(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);

    const url = tab === "chat" ? "/" : `/?tab=${tab}`;
    window.history.replaceState(null, "", url);
  };

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
    <Box style={{ height: "100vh" }}>
      <Flex
        direction="column"
        style={{
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Navbar />
        <Flex style={{ flex: 1, overflow: "hidden" }}>
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
          <Flex
            style={{
              flex: 1,
              overflow: "hidden",
              background: "var(--gray-2)",
              padding: activeTab === "chat" ? 0 : 16,
            }}
          >
            <Box
              style={{
                width: "100%",
                height: "100%",
                overflowX: "hidden",
                overflowY: activeTab === "chat" ? "hidden" : "auto",
                background: activeTab === "chat" ? "transparent" : "var(--gray-1)",
                border: activeTab === "chat" ? "none" : "1px solid var(--gray-5)",
                borderRadius: activeTab === "chat" ? 0 : 8,
              }}
            >
              {renderActiveTab()}
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
