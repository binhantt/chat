"use client";

import { Callout, Flex, Spinner, Text } from "@radix-ui/themes";
import {
  UserDetailDialog,
  UserListPanel,
  UsersHeader,
  UsersStatGrid,
  UsersToolbar,
} from "@/features/admin/components/users";
import { useAdminUsersPage } from "@/features/admin/hooks/useAdminUsersPage";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function UsersClientView() {
  const s = useAdminStyles();
  const {
    detailOpen,
    error,
    filteredUsers,
    goNextPage,
    goPreviousPage,
    hasNext,
    hasPrevious,
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
  } = useAdminUsersPage();

  if (loading) {
    return (
      <Flex align="center" justify="center" className={s.users.loadingContainer}>
        <Flex align="center" direction="column" gap="3">
          <Spinner size="3" />
          <Text className={s.users.loadingText}>Đang tải danh sách người dùng...</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="5">
      <UsersHeader count={filteredUsers.length} onRefresh={refreshUsers} />

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <UsersStatGrid active={stats.active} banned={stats.banned} total={stats.total} />
      <UsersToolbar onSearchChange={setSearch} onStatusChange={setStatusFilter} search={search} status={statusFilter} />
      <UserListPanel
        currentPage={currentPage}
        filteredCount={filteredUsers.length}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        loadingPage={pageChanging}
        onNext={goNextPage}
        onPrevious={goPreviousPage}
        onUpdate={refreshUsers}
        onView={handleViewUser}
        pageEnd={pageEnd}
        pageStart={pageStart}
        users={filteredUsers}
      />

      <UserDetailDialog onOpenChange={setDetailOpen} open={detailOpen} user={selectedUser} />
    </Flex>
  );
}
