"use client";

import { useEffect } from "react";
import type { TabId } from "@/components/layouts/users/Sidebar";
import { useUserLayoutStore } from "../store/useUserLayoutStore";

const tabIds: TabId[] = ["chat", "website", "about", "vip", "settings", "report"];

export function isTabId(value: string | null): value is TabId {
  return !!value && tabIds.includes(value as TabId);
}

export function useUserTabs() {
  const activeTab = useUserLayoutStore((state) => state.activeTab);
  const setActiveTab = useUserLayoutStore((state) => state.setActiveTab);

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (isTabId(tab)) {
      setActiveTab(tab);
    }
  }, [setActiveTab]);

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", tab === "chat" ? "/" : `/?tab=${tab}`);
  };

  return { activeTab, changeTab };
}
