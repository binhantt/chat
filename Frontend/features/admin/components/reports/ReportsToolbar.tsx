import { Button, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { reportsInnerBorder } from "@/features/admin/styles/reportsTheme";
import type { ReportStatusFilter } from "./types";

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
  return (
    <Flex
      align="center"
      gap="3"
      justify="between"
      wrap="wrap"
      style={{
        background: authTheme.panel,
        border: reportsInnerBorder,
        borderRadius: 8,
        padding: 10,
      }}
    >
      <Flex gap="1" wrap="wrap">
        {filters.map((item) => (
          <Button
            key={item.value}
            onClick={() => onStatusChange(item.value)}
            size="2"
            variant={status === item.value ? "solid" : "soft"}
            style={{ borderRadius: 8 }}
          >
            {item.label}
          </Button>
        ))}
      </Flex>
      <Text size="2" style={{ color: authTheme.muted }}>
        Hiển thị {filteredCount} / {totalCount}
      </Text>
    </Flex>
  );
}
