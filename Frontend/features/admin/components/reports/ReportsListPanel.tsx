import { Button, Flex, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon, FileTextIcon } from "@radix-ui/react-icons";
import type { AdminReport, ReportAiReview } from "./types";
import { ReportExpandedPanel } from "./ReportExpandedPanel";
import { ReportRow } from "./ReportRow";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function ReportsListPanel({
  aiReview,
  aiReviewing,
  currentPage,
  expandedId,
  filteredCount,
  hasNext,
  hasPrevious,
  lockType,
  loadingPage,
  newStatus,
  onAiReview,
  onApplyAiSuggestion,
  onLockTypeChange,
  onNext,
  onOpen,
  onPrevious,
  onStatusChange,
  onUpdate,
  pageEnd,
  pageStart,
  reports,
  updating,
}: {
  aiReview: ReportAiReview | null;
  aiReviewing: boolean;
  currentPage: number;
  expandedId: string | null;
  filteredCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  lockType: string;
  loadingPage: boolean;
  newStatus: string;
  onAiReview: () => void;
  onApplyAiSuggestion: () => void;
  onLockTypeChange: (value: string) => void;
  onNext: () => void;
  onOpen: (report: AdminReport) => void;
  onPrevious: () => void;
  onStatusChange: (value: string) => void;
  onUpdate: () => void;
  pageEnd: number;
  pageStart: number;
  reports: AdminReport[];
  updating: boolean;
}) {
  const s = useAdminStyles();
  return (
    <Flex direction="column" gap="3" className={s.reports.listPanel}>
      <Flex align={{ initial: "start", sm: "center" }} direction={{ initial: "column", sm: "row" }} gap="2" justify="between">
        <Flex align="center" gap="2">
          <FileTextIcon color="var(--primary)" />
          <Text size="4" weight="bold" className={s.reports.listPanelTitle}>
            Danh sách báo cáo
          </Text>
        </Flex>
        <Text size="2" className={s.reports.listPanelSubtitle}>
          {filteredCount > 0 ? `Hiển thị ${pageStart + 1}-${pageEnd}` : "Chưa có dữ liệu"}
        </Text>
      </Flex>

      {reports.length === 0 ? (
        <Flex align="center" direction="column" gap="2" justify="center" className={s.reports.emptyState}>
          <FileTextIcon color="var(--primary)" height={42} width={42} />
          <Text size="3" weight="bold" className={s.reports.emptyStateTitle}>
            Không có báo cáo nào
          </Text>
          <Text size="2" className={s.reports.emptyStateSubtitle}>
            Thử đổi bộ lọc hoặc kiểm tra lại sau.
          </Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="3">
          {reports.map((report) => {
            const expanded = expandedId === report.id;

            return (
              <Flex direction="column" gap="2" key={report.id}>
                <ReportRow expanded={expanded} onOpen={onOpen} report={report} />
                {expanded && (
                  <ReportExpandedPanel
                    aiReview={aiReview}
                    aiReviewing={aiReviewing}
                    lockType={lockType}
                    newStatus={newStatus}
                    onAiReview={onAiReview}
                    onApplyAiSuggestion={onApplyAiSuggestion}
                    onLockTypeChange={onLockTypeChange}
                    onStatusChange={onStatusChange}
                    onUpdate={onUpdate}
                    report={report}
                    updating={updating}
                  />
                )}
              </Flex>
            );
          })}
        </Flex>
      )}

      {filteredCount > 0 && (
        <Flex align="center" gap="3" justify="between" pt="1" wrap="wrap">
          <Text size="2" className={s.reports.pageInfo}>
            Trang {currentPage}
          </Text>
          <Flex align="center" gap="2">
            <Button disabled={!hasPrevious || loadingPage} onClick={onPrevious} size="2" variant="soft">
              <ChevronLeftIcon />
              Trước
            </Button>
            <Button disabled={!hasNext || loadingPage} onClick={onNext} size="2" variant="soft">
              {loadingPage ? "Đang tải..." : "Sau"}
              <ChevronRightIcon />
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
