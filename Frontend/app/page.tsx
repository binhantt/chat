"use client";

import { Flex, Box } from "@radix-ui/themes";
import { useState } from "react";
import { Navbar } from "@/components/layouts/users/Navbar";
import { Sidebar, TabId } from "@/components/layouts/users/Sidebar";
import { AboutPage } from "@/features/introduction/page/AboutPage";
import { SettingsPage } from "@/features/settings/page/SettingsPage";
import { ChatPage } from "@/features/chat/page/ChatPage";
import { ReportPage } from "@/features/report";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("chat");

  return (
    <Box  style={{ height: "100vh",   }}>
      <Flex
        direction="column"
        style={{
          height: "100%",
          overflow: "hidden",
       
        }}
      >
        <Navbar />
        <Flex style={{ flex: 1, overflow: "hidden" }}>
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <Flex
            style={{ flex: 1, overflowY: "auto" }}
            direction="column"
            position="relative"
          >
            {activeTab === "about" && <AboutPage />}
            {activeTab === "chat" && <ChatPage />}
            {activeTab === "settings" && <SettingsPage />}
            {activeTab === "report" && <ReportPage />}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
