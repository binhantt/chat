import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

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
  const s = useAdminStyles();
  return (
    <Flex
      align="center"
      gap="3"
      justify="between"
      wrap="wrap"
      className={s.conduct.toolbar}
    >
      <TextField.Root
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Tìm nội dung vi phạm..."
        className={s.conduct.toolbarSearch}
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
            className={s.conduct.toolbarFilterBtn}
          >
            {item.label}
          </Button>
        ))}
        <Text size="2" className={s.conduct.toolbarCount}>
          Hiển thị {filteredCount} / {totalCount}
        </Text>
      </Flex>
    </Flex>
  );
}
