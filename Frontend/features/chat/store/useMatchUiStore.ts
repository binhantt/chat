"use client";

import { create } from "zustand";
import type { MatchedUser } from "../types";

export type MatchStatus = "idle" | "searching" | "matched" | "not_found";

export type MatchResult = {
  chatReady?: boolean;
  conversationId: string;
  currentUserAccepted?: boolean;
  matchedUser: MatchedUser;
  matchedUserId: string;
  partnerAccepted?: boolean;
};

type MatchUiState = {
  matchResult: MatchResult | null;
  resetMatch: () => void;
  setMatchResult: (matchResult: MatchResult | null) => void;
  setStatus: (status: MatchStatus) => void;
  status: MatchStatus;
};

export const useMatchUiStore = create<MatchUiState>((set) => ({
  matchResult: null,
  resetMatch: () => set({ matchResult: null, status: "idle" }),
  setMatchResult: (matchResult) => set({ matchResult }),
  setStatus: (status) => set({ status }),
  status: "idle",
}));
