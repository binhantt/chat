import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminReport } from "@/features/admin/components/reports";
import { useAdminReportsStore } from "../store/useAdminReportsStore";

const REPORTS_FETCH_LIMIT = 20;

export function useAdminReportsPage() {
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pageChanging, setPageChanging] = useState(false);
  const error = useAdminReportsStore((state) => state.error);
  const expandedId = useAdminReportsStore((state) => state.expandedId);
  const loading = useAdminReportsStore((state) => state.loading);
  const lockType = useAdminReportsStore((state) => state.lockType);
  const newStatus = useAdminReportsStore((state) => state.newStatus);
  const reports = useAdminReportsStore((state) => state.reports);
  const statusFilter = useAdminReportsStore((state) => state.statusFilter);
  const updating = useAdminReportsStore((state) => state.updating);
  const setError = useAdminReportsStore((state) => state.setError);
  const setExpandedId = useAdminReportsStore((state) => state.setExpandedId);
  const setLoading = useAdminReportsStore((state) => state.setLoading);
  const setLockType = useAdminReportsStore((state) => state.setLockType);
  const setNewStatus = useAdminReportsStore((state) => state.setNewStatus);
  const setReports = useAdminReportsStore((state) => state.setReports);
  const setStatusFilter = useAdminReportsStore((state) => state.setStatusFilter);
  const setUpdating = useAdminReportsStore((state) => state.setUpdating);
  const updateReport = useAdminReportsStore((state) => state.updateReport);

  const fetchReportsPage = useCallback(async (cursor: string | null, silent = false) => {
    if (silent) {
      setPageChanging(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(REPORTS_FETCH_LIMIT) });
      if (cursor) {
        params.set("cursor", cursor);
      }
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const response = await fetch(`/api/v1/manager/reports?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Cannot fetch reports list");
      }

      const data: unknown = await response.json();
      if (Array.isArray(data)) {
        setReports(data as AdminReport[]);
        setNextCursor(null);
      } else if (data && typeof data === "object" && "items" in data) {
        const page = data as { items?: AdminReport[]; nextCursor?: string | null };
        setReports(page.items ?? []);
        setNextCursor(page.nextCursor ?? null);
      } else {
        setReports([]);
        setNextCursor(null);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError("Cannot fetch reports list");
    } finally {
      setLoading(false);
      setPageChanging(false);
    }
  }, [setError, setLoading, setReports, statusFilter]);

  const fetchReports = useCallback(async () => {
    setCurrentCursor(null);
    setCurrentPage(1);
    setCursorStack([]);
    await fetchReportsPage(null);
  }, [fetchReportsPage]);

  const goNextPage = useCallback(async () => {
    if (!nextCursor || pageChanging) return;

    const nextPageCursor = nextCursor;
    setCursorStack((current) => [...current, currentCursor]);
    setCurrentCursor(nextPageCursor);
    setCurrentPage((page) => page + 1);
    setExpandedId(null);
    await fetchReportsPage(nextPageCursor, true);
  }, [currentCursor, fetchReportsPage, nextCursor, pageChanging, setExpandedId]);

  const goPreviousPage = useCallback(async () => {
    if (cursorStack.length === 0 || pageChanging) return;

    const previousCursor = cursorStack[cursorStack.length - 1] ?? null;
    setCursorStack((current) => current.slice(0, -1));
    setCurrentCursor(previousCursor);
    setCurrentPage((page) => Math.max(1, page - 1));
    setExpandedId(null);
    await fetchReportsPage(previousCursor, true);
  }, [cursorStack, fetchReportsPage, pageChanging, setExpandedId]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchReports();
    });
  }, [fetchReports]);

  useEffect(() => {
    queueMicrotask(() => {
      setExpandedId(null);
    });
  }, [setExpandedId, statusFilter]);

  const stats = useMemo(
    () => ({
      pending: reports.filter((report) => report.status === "pending").length,
      rejected: reports.filter((report) => report.status === "rejected").length,
      resolved: reports.filter((report) => report.status === "resolved").length,
      total: reports.length,
    }),
    [reports],
  );

  const filteredReports = reports;
  const pageStart = filteredReports.length > 0 ? (currentPage - 1) * REPORTS_FETCH_LIMIT : 0;
  const pageEnd = filteredReports.length > 0 ? pageStart + filteredReports.length : 0;
  const expandedReport = reports.find((report) => report.id === expandedId) || null;

  const openReport = useCallback(
    (report: AdminReport) => {
      const nextId = expandedId === report.id ? null : report.id;
      setExpandedId(nextId);
      setNewStatus(report.status);
      setLockType(report.lockType && report.lockType !== "none" ? report.lockType : "");
    },
    [expandedId, setExpandedId, setLockType, setNewStatus],
  );

  const handleUpdateStatus = useCallback(async () => {
    if (!expandedReport || !newStatus) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/v1/manager/reports/${expandedReport.id}/status`, {
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === "resolved" ? { lockType } : {}),
        }),
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
        method: "PATCH",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Update failed");
      }

      const updated: AdminReport = await response.json();
      updateReport(updated);
      setExpandedId(updated.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cannot update report");
    } finally {
      setUpdating(false);
    }
  }, [expandedReport, lockType, newStatus, setExpandedId, setUpdating, updateReport]);

  return {
    error,
    expandedId,
    fetchReports,
    filteredReports,
    goNextPage,
    goPreviousPage,
    handleUpdateStatus,
    hasNext: Boolean(nextCursor),
    hasPrevious: cursorStack.length > 0,
    loading,
    lockType,
    newStatus,
    openReport,
    pageEnd,
    pageStart,
    currentPage,
    pageChanging,
    reports,
    setLockType,
    setNewStatus,
    setStatusFilter,
    stats,
    statusFilter,
    updating,
  };
}

function getCsrfHeaders(): HeadersInit {
  const csrfToken = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("csrf_token="))
    ?.split("=")
    .slice(1)
    .join("=");

  return csrfToken
    ? {
        "x-csrf-token": decodeURIComponent(csrfToken),
      }
    : {};
}
