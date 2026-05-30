"use client";

import { create } from "zustand";

type AuthUiState = {
  error: string | null;
  isGoogleReady: boolean;
  isSubmitting: boolean;
  setError: (error: string | null) => void;
  setGoogleReady: (isGoogleReady: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
  error: null,
  isGoogleReady: false,
  isSubmitting: false,
  setError: (error) => set({ error }),
  setGoogleReady: (isGoogleReady) => set({ isGoogleReady }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
}));
