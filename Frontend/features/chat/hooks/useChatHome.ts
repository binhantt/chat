"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getCsrfHeaders } from "@/lib/csrf";
import { useChatHomeStore } from "../store/useChatHomeStore";
import type { ChatSessionState, MatchedUser } from "../types";

const CHAT_SESSION_KEY = "chat.activeConversation";

export function useChatHome() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const clearedConversationRef = useRef<string | null>(null);
  const conversationId = useChatHomeStore((state) => state.conversationId);
  const matchedUser = useChatHomeStore((state) => state.matchedUser);
  const mode = useChatHomeStore((state) => state.mode);
  const selectedUser = useChatHomeStore((state) => state.selectedUser);
  const resetChatSession = useChatHomeStore((state) => state.resetChatSession);
  const setChatSession = useChatHomeStore((state) => state.setChatSession);
  const setMode = useChatHomeStore((state) => state.setMode);

  const clearChatRoute = useCallback(() => {
    if (searchParams.has("conv") || searchParams.has("user")) {
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const resetChatState = useCallback(() => {
    clearedConversationRef.current = conversationId;
    resetChatSession();
    clearChatRoute();
    window.sessionStorage.removeItem(CHAT_SESSION_KEY);
  }, [clearChatRoute, conversationId, resetChatSession]);

  const leaveCurrentMatch = useCallback(async () => {
    await fetch("/api/v1/match/leave", {
      credentials: "include",
      method: "DELETE",
      headers: { ...getCsrfHeaders() },
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const convParam = searchParams.get("conv");
    const userParam = searchParams.get("user");
    if (convParam && convParam === clearedConversationRef.current) {
      clearChatRoute();
      return;
    }

    if (convParam && userParam) {
      queueMicrotask(() => {
        setChatSession({
          conversationId: convParam,
          matchedUser: {
            avatarUrl: null,
            badge: null,
            city: null,
            email: "",
            fullName: null,
            gender: null,
            id: userParam,
          },
          selectedUser: userParam,
        });
      });
      return;
    }

    try {
      const raw = window.sessionStorage.getItem(CHAT_SESSION_KEY);
      if (!raw) return;

      // Don't restore if we just cleared this conversation
      const saved = JSON.parse(raw) as Partial<ChatSessionState>;
      if (saved.conversationId && saved.selectedUser && saved.conversationId !== clearedConversationRef.current) {
        queueMicrotask(() => {
          setChatSession({
            conversationId: saved.conversationId!,
            matchedUser: saved.matchedUser ?? null,
            selectedUser: saved.selectedUser!,
          });
        });
      }
    } catch {
      window.sessionStorage.removeItem(CHAT_SESSION_KEY);
    }
  }, [clearChatRoute, searchParams, setChatSession]);

  useEffect(() => {
    if (conversationId && selectedUser) {
      const state: ChatSessionState = {
        conversationId,
        matchedUser,
        selectedUser,
      };
      window.sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(state));
      return;
    }

    if (mode !== "match" && mode !== "search") {
      window.sessionStorage.removeItem(CHAT_SESSION_KEY);
    }
  }, [conversationId, matchedUser, mode, selectedUser]);

  const handleSearchClick = () => {
    clearChatRoute();
    setMode("search");
  };

  const handleMatchClick = async () => {
    await leaveCurrentMatch();
    resetChatState();
    setMode("match");
  };

  const handleHomeClick = () => {
    resetChatState();
    setMode("match");
  };

  const handleChatBack = () => {
    resetChatState();
    setMode("match");
  };

  const handleMatched = (convId: string, matched: MatchedUser) => {
    clearChatRoute();
    setChatSession({
      conversationId: convId,
      matchedUser: matched,
      selectedUser: matched.id,
    });
  };

  const handleSelectConversation = (convId: string, partner: MatchedUser) => {
    clearChatRoute();
    setChatSession({
      conversationId: convId,
      matchedUser: partner,
      selectedUser: partner.id,
    });
  };

  const handleCancelMatch = () => {
    void leaveCurrentMatch();
    resetChatState();
    setMode("match");
  };

  return {
    conversationId,
    handleCancelMatch,
    handleChatBack,
    handleHomeClick,
    handleMatchClick,
    handleMatched,
    handleSearchClick,
    handleSelectConversation,
    matchedUser,
    mode,
    selectedUser,
  };
}
