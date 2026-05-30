import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { chatInnerBorder } from "@/features/admin/styles/chatTheme";
import type { ChatStatusFilter } from "./chatUtils";

const filters: { label: string; value: ChatStatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Hoạt động", value: "active" },
  { label: "Đã kết thúc", value: "ended" },
  { label: "Đã chặn", value: "blocked" },
];

export function ChatToolbar({
  filteredCount,
  onSearchChange,
  onStatusChange,
  search,
  status,
  totalCount,
}: {
  filteredCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: ChatStatusFilter) => void;
  search: string;
  status: ChatStatusFilter;
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
        border: chatInnerBorder,
        borderRadius: 8,
        padding: 10,
      }}
    >
      <TextField.Root
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Tìm theo ID, tên hoặc email..."
        style={{ flex: "1 1 320px", minWidth: 240 }}
        value={search}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>

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
