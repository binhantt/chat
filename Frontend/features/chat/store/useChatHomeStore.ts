"use client";

import { create } from "zustand";
import type { CenterMode, MatchedUser } from "../types";

type ChatHomeState = {
  conversationId: string | null;
  matchedUser: MatchedUser | null;
  mode: CenterMode;
  selectedUser: string | null;
  resetChatSession: () => void;
  setChatSession: (session: {
    conversationId: string;
    matchedUser: MatchedUser | null;
    selectedUser: string;
  }) => void;
  setMatchedUser: (matchedUser: MatchedUser | null) => void;
  setMode: (mode: CenterMode) => void;
};

export const useChatHomeStore = create<ChatHomeState>((set) => ({
  conversationId: null,
  matchedUser: null,
  mode: "match",
  selectedUser: null,
  resetChatSession: () =>
    set({
      conversationId: null,
      matchedUser: null,
      selectedUser: null,
    }),
  setChatSession: ({ conversationId, matchedUser, selectedUser }) =>
    set({
      conversationId,
      matchedUser,
      mode: "chat",
      selectedUser,
    }),
  setMatchedUser: (matchedUser) => set({ matchedUser }),
  setMode: (mode) => set({ mode }),
}));
