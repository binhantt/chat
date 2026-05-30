import { create } from "zustand";
import type { AdminReport, ReportStatusFilter } from "@/features/admin/components/reports";

interface AdminReportsState {
  error: string | null;
  expandedId: string | null;
  loading: boolean;
  lockType: string;
  newStatus: string;
  reports: AdminReport[];
  statusFilter: ReportStatusFilter;
  updating: boolean;
  setError: (error: string | null) => void;
  setExpandedId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setLockType: (lockType: string) => void;
  setNewStatus: (status: string) => void;
  setReports: (reports: AdminReport[]) => void;
  setStatusFilter: (status: ReportStatusFilter) => void;
  setUpdating: (updating: boolean) => void;
  updateReport: (report: AdminReport) => void;
}

export const useAdminReportsStore = create<AdminReportsState>((set) => ({
  error: null,
  expandedId: null,
  loading: true,
  lockType: "",
  newStatus: "",
  reports: [],
  statusFilter: "all",
  updating: false,
  setError: (error) => set({ error }),
  setExpandedId: (expandedId) => set({ expandedId }),
  setLoading: (loading) => set({ loading }),
  setLockType: (lockType) => set({ lockType }),
  setNewStatus: (newStatus) => set({ newStatus }),
  setReports: (reports) => set({ reports }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setUpdating: (updating) => set({ updating }),
  updateReport: (report) =>
    set((state) => ({
      reports: state.reports.map((item) => (item.id === report.id ? report : item)),
    })),
}));
