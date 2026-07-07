import { Button, Flex, Text } from "@radix-ui/themes";
import type { ReportStatusFilter } from "./types";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

const filters: { label: string; value: ReportStatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đã xem xét", value: "reviewed" },
  { label: "Vi phạm", value: "resolved" },
  { label: "Từ chối", value: "rejected" },
];

export function ReportsToolbar({
  filteredCount,
  onStatusChange,
  status,
  totalCount,
}: {
  filteredCount: number;
  onStatusChange: (status: ReportStatusFilter) => void;
  status: ReportStatusFilter;
  totalCount: number;
}) {
  const s = useAdminStyles();
  return (
    <Flex
      align="center"
      gap="3"
      justify="between"
      wrap="wrap"
      className={s.reports.toolbar}
    >
      <Flex gap="1" wrap="wrap">
        {filters.map((item) => (
          <Button
            key={item.value}
            onClick={() => onStatusChange(item.value)}
            size="2"
            variant={status === item.value ? "solid" : "soft"}
            className={s.reports.roundedBtn}
          >
            {item.label}
          </Button>
        ))}
      </Flex>
      <Text size="2" className={s.reports.toolbarCount}>
        Hiển thị {filteredCount} / {totalCount}
      </Text>
    </Flex>
  );
}
