import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { conductInnerBorder } from "@/features/admin/styles/conductTheme";

export type ConductStatusFilter = "active" | "all" | "inactive";

const filters: { label: string; value: ConductStatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Đang bật", value: "active" },
  { label: "Đang tắt", value: "inactive" },
];

export function ConductToolbar({
  filteredCount,
  onSearchChange,
  onStatusChange,
  search,
  status,
  totalCount,
}: {
  filteredCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ConductStatusFilter) => void;
  search: string;
  status: ConductStatusFilter;
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
        border: conductInnerBorder,
        borderRadius: 8,
        padding: 10,
      }}
    >
      <TextField.Root
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Tìm nội dung vi phạm..."
        style={{ borderRadius: 8, flex: "1 1 320px", maxWidth: 520 }}
        value={search}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>

      <Flex align="center" gap="2" wrap="wrap">
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
        <Text size="2" style={{ color: authTheme.muted, minWidth: 110, textAlign: "right" }}>
          Hiển thị {filteredCount} / {totalCount}
        </Text>
      </Flex>
    </Flex>
  );
}
