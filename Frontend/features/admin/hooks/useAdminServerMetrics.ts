import { useCallback } from "react";
import { getAdminServerMetrics } from "@/features/athu";
import { useAdminServerMetricsStore } from "../store/useAdminServerMetricsStore";

export function useAdminServerMetrics() {
  const error = useAdminServerMetricsStore((state) => state.error);
  const loading = useAdminServerMetricsStore((state) => state.loading);
  const metrics = useAdminServerMetricsStore((state) => state.metrics);
  const setError = useAdminServerMetricsStore((state) => state.setError);
  const setLoading = useAdminServerMetricsStore((state) => state.setLoading);
  const setMetrics = useAdminServerMetricsStore((state) => state.setMetrics);

  const refresh = useCallback(async () => {
    try {
      const nextMetrics = await getAdminServerMetrics();
      setMetrics(nextMetrics);
      setError(null);
    } catch (err) {
      console.error("Failed to load server metrics:", err);
      setError("Cannot fetch server metrics");
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setMetrics]);

  return {
    error,
    loading,
    metrics,
    refresh,
  };
}
