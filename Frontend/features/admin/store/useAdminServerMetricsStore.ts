import { create } from "zustand";
import type { AdminServerMetrics } from "@/features/athu";

interface AdminServerMetricsState {
  error: string | null;
  loading: boolean;
  metrics: AdminServerMetrics | null;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setMetrics: (metrics: AdminServerMetrics | null) => void;
}

export const useAdminServerMetricsStore = create<AdminServerMetricsState>((set) => ({
  error: null,
  loading: true,
  metrics: null,
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  setMetrics: (metrics) => set({ metrics }),
}));
