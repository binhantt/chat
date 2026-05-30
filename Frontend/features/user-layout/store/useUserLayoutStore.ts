"use client";

import { create } from "zustand";
import type { TabId } from "@/components/layouts/users/Sidebar";

type UserLayoutState = {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
};

export const useUserLayoutStore = create<UserLayoutState>((set) => ({
  activeTab: "chat",
  setActiveTab: (activeTab) => set({ activeTab }),
}));
