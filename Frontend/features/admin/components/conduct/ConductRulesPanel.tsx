import { Button, Flex, Spinner, Text } from "@radix-ui/themes";
import { ChevronRightIcon, LockClosedIcon } from "@radix-ui/react-icons";
import type { ConductRule } from "@/features/athu";
import { authTheme } from "@/features/athu/styles/authTheme";
import { conductPanelStyle } from "@/features/admin/styles/conductTheme";
import { ConductRuleRow } from "./ConductRuleRow";

export function ConductRulesPanel({
  filteredCount,
  loading,
  loadingMore,
  nextCursor,
  onDelete,
  onLoadMore,
  onToggle,
  pendingRuleIds,
  rules,
  totalCount,
}: {
  filteredCount: number;
  loading: boolean;
  loadingMore: boolean;
  nextCursor: string | null;
  onDelete: (rule: ConductRule) => void;
  onLoadMore: () => void;
  onToggle: (rule: ConductRule, checked: boolean) => void;
  pendingRuleIds: Set<string>;
  rules: ConductRule[];
  totalCount: number;
}) {
  return (
    <Flex direction="column" gap="3" style={conductPanelStyle}>
      <Flex align={{ initial: "start", sm: "center" }} direction={{ initial: "column", sm: "row" }} gap="2" justify="between">
        <Flex align="center" gap="2">
          <LockClosedIcon color={authTheme.control} />
          <Text size="4" weight="bold" style={{ color: authTheme.text }}>
            Danh sách luật ứng xử
          </Text>
        </Flex>
        <Text size="2" style={{ color: authTheme.muted }}>
          {filteredCount > 0 ? `Hiển thị ${filteredCount} / ${totalCount}` : "Chưa có dữ liệu"}
        </Text>
      </Flex>

      {loading ? (
        <Flex align="center" gap="2" justify="center" style={{ minHeight: 240 }}>
          <Spinner size="2" />
          <Text style={{ color: authTheme.muted }}>Đang tải danh sách luật...</Text>
        </Flex>
      ) : rules.length === 0 ? (
        <Flex align="center" direction="column" gap="2" justify="center" style={{ minHeight: 240 }}>
          <LockClosedIcon color={authTheme.control} height={42} width={42} />
          <Text size="3" weight="bold" style={{ color: authTheme.text }}>
            Không có luật ứng xử nào
          </Text>
          <Text size="2" style={{ color: authTheme.muted }}>
            Thử đổi bộ lọc hoặc thêm nội dung vi phạm mới.
          </Text>
        </Flex>
      ) : (
        <Flex direction="column" gap="3">
          {rules.map((rule) => (
            <ConductRuleRow
              key={rule.id}
              onDelete={onDelete}
              onToggle={onToggle}
              pending={pendingRuleIds.has(rule.id)}
              rule={rule}
            />
          ))}
        </Flex>
      )}

      {nextCursor && (
        <Flex justify="center" pt="1">
          <Button disabled={loadingMore} onClick={onLoadMore} size="2" variant="soft" style={{ borderRadius: 8 }}>
            {loadingMore ? "Đang tải..." : "Tải thêm"}
            <ChevronRightIcon />
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
