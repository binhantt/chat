import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminUser, getAdminUsers, type AdminUser } from "@/features/athu";
import { isUserLocked } from "@/features/admin/components/users/userUtils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAdminUsersStore } from "../store/useAdminUsersStore";

const USERS_PAGE_SIZE = 10;

export function useAdminUsersPage() {
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageChanging, setPageChanging] = useState(false);
  const detailOpen = useAdminUsersStore((state) => state.detailOpen);
  const error = useAdminUsersStore((state) => state.error);
  const loading = useAdminUsersStore((state) => state.loading);
  const nextCursor = useAdminUsersStore((state) => state.nextCursor);
  const search = useAdminUsersStore((state) => state.search);
  const selectedUser = useAdminUsersStore((state) => state.selectedUser);
  const statusFilter = useAdminUsersStore((state) => state.statusFilter);
  const users = useAdminUsersStore((state) => state.users);
  const setDetailOpen = useAdminUsersStore((state) => state.setDetailOpen);
  const setError = useAdminUsersStore((state) => state.setError);
  const setLoading = useAdminUsersStore((state) => state.setLoading);
  const setSearch = useAdminUsersStore((state) => state.setSearch);
  const setSelectedUser = useAdminUsersStore((state) => state.setSelectedUser);
  const setStatusFilter = useAdminUsersStore((state) => state.setStatusFilter);
  const setUsersPage = useAdminUsersStore((state) => state.setUsersPage);
  const debouncedSearch = useDebouncedValue(search);

  const fetchUsersPage = useCallback(async (cursor: string | null, silent = false) => {
    if (silent) {
      setPageChanging(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const page = await getAdminUsers({ cursor, limit: USERS_PAGE_SIZE, status: statusFilter });
      setUsersPage(page.items, page.nextCursor);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Cannot fetch users list");
    } finally {
      setLoading(false);
      setPageChanging(false);
    }
  }, [setError, setLoading, setUsersPage, statusFilter]);

  const fetchUsers = useCallback(async () => {
    setCurrentCursor(null);
    setCurrentPage(1);
    setCursorStack([]);
    await fetchUsersPage(null);
  }, [fetchUsersPage]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const goNextPage = useCallback(async () => {
    if (!nextCursor || pageChanging) return;

    const nextPageCursor = nextCursor;
    setCursorStack((current) => [...current, currentCursor]);
    setCurrentCursor(nextPageCursor);
    setCurrentPage((page) => page + 1);
    await fetchUsersPage(nextPageCursor, true);
  }, [currentCursor, fetchUsersPage, nextCursor, pageChanging]);

  const goPreviousPage = useCallback(async () => {
    if (cursorStack.length === 0 || pageChanging) return;

    const previousCursor = cursorStack[cursorStack.length - 1] ?? null;
    setCursorStack((current) => current.slice(0, -1));
    setCurrentCursor(previousCursor);
    setCurrentPage((page) => Math.max(1, page - 1));
    await fetchUsersPage(previousCursor, true);
  }, [cursorStack, fetchUsersPage, pageChanging]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchUsers();
    });
  }, [fetchUsers]);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const normalizedSearch = debouncedSearch.trim().toLowerCase();
        return (
          !normalizedSearch ||
          user.fullName?.toLowerCase().includes(normalizedSearch) ||
          user.email.toLowerCase().includes(normalizedSearch)
        );
      }),
    [debouncedSearch, users],
  );

  const pageStart = filteredUsers.length > 0 ? (currentPage - 1) * USERS_PAGE_SIZE : 0;
  const pageEnd = filteredUsers.length > 0 ? pageStart + filteredUsers.length : 0;

  const stats = useMemo(
    () => ({
      active: users.filter((user) => !isUserLocked(user)).length,
      banned: users.filter((user) => isUserLocked(user)).length,
      total: users.length,
    }),
    [users],
  );

  const handleViewUser = useCallback(
    async (user: AdminUser) => {
      setSelectedUser(null);
      setDetailOpen(true);

      try {
        const data = await getAdminUser(user.id);
        setSelectedUser(data);
      } catch (err) {
        console.error("Error fetching user detail:", err);
        setDetailOpen(false);
        setError("Cannot fetch account details");
      }
    },
    [setDetailOpen, setError, setSelectedUser],
  );

  return {
    detailOpen,
    error,
    filteredUsers,
    goNextPage,
    goPreviousPage,
    hasNext: Boolean(nextCursor),
    hasPrevious: cursorStack.length > 0,
    handleViewUser,
    loading,
    pageChanging,
    pageEnd,
    pageStart,
    currentPage,
    refreshUsers,
    search,
    selectedUser,
    setDetailOpen,
    setSearch,
    setStatusFilter,
    stats,
    statusFilter,
  };
}
