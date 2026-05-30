"use client";

import { Callout, Flex, Spinner, Text } from "@radix-ui/themes";
import {
  ReportsHeader,
  ReportsListPanel,
  ReportsStatGrid,
  ReportsToolbar,
} from "@/features/admin/components/reports";
import { useAdminReportsPage } from "@/features/admin/hooks/useAdminReportsPage";
import { authTheme } from "@/features/athu/styles/authTheme";

export function ReportsClientView() {
  const {
    error,
    expandedId,
    fetchReports,
    filteredReports,
    goNextPage,
    goPreviousPage,
    handleUpdateStatus,
    hasNext,
    hasPrevious,
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
  } = useAdminReportsPage();

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 420 }}>
        <Flex align="center" direction="column" gap="3">
          <Spinner size="3" />
          <Text style={{ color: authTheme.muted }}>Đang tải danh sách báo cáo...</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="5">
      <ReportsHeader onRefresh={fetchReports} />

      {error && (
        <Callout.Root color="red">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      <ReportsStatGrid stats={stats} />
      <ReportsToolbar
        filteredCount={filteredReports.length}
        onStatusChange={setStatusFilter}
        status={statusFilter}
        totalCount={reports.length}
      />
      <ReportsListPanel
        currentPage={currentPage}
        expandedId={expandedId}
        filteredCount={filteredReports.length}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        lockType={lockType}
        loadingPage={pageChanging}
        newStatus={newStatus}
        onLockTypeChange={setLockType}
        onNext={goNextPage}
        onOpen={openReport}
        onPrevious={goPreviousPage}
        onStatusChange={setNewStatus}
        onUpdate={handleUpdateStatus}
        pageEnd={pageEnd}
        pageStart={pageStart}
        reports={filteredReports}
        updating={updating}
      />
    </Flex>
  );
}
