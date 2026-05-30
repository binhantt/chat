import { create } from "zustand";
import type { AdminUser } from "@/features/athu";
import type { UserStatusFilter } from "@/features/admin/components/users";

interface AdminUsersState {
  detailOpen: boolean;
  error: string | null;
  loading: boolean;
  loadingMore: boolean;
  nextCursor: string | null;
  search: string;
  selectedUser: AdminUser | null;
  statusFilter: UserStatusFilter;
  users: AdminUser[];
  appendUsers: (users: AdminUser[], nextCursor: string | null) => void;
  setDetailOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loadingMore: boolean) => void;
  setSearch: (search: string) => void;
  setSelectedUser: (user: AdminUser | null) => void;
  setStatusFilter: (status: UserStatusFilter) => void;
  setUsersPage: (users: AdminUser[], nextCursor: string | null) => void;
}

export const useAdminUsersStore = create<AdminUsersState>((set) => ({
  detailOpen: false,
  error: null,
  loading: true,
  loadingMore: false,
  nextCursor: null,
  search: "",
  selectedUser: null,
  statusFilter: "all",
  users: [],
  appendUsers: (users, nextCursor) =>
    set((state) => ({ nextCursor, users: [...state.users, ...users] })),
  setDetailOpen: (detailOpen) => set({ detailOpen }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
  setLoadingMore: (loadingMore) => set({ loadingMore }),
  setSearch: (search) => set({ search }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setUsersPage: (users, nextCursor) => set({ nextCursor, users }),
}));
