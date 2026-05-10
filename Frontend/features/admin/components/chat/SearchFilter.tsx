import { Button, Flex, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "ended" | "blocked";
  onStatusFilterChange: (status: "all" | "active" | "ended" | "blocked") => void;
}

export function SearchFilter({ search, onSearchChange, statusFilter, onStatusFilterChange }: SearchFilterProps) {
  return (
    <Flex gap="4" align="center" wrap="wrap" justify="center">
      <TextField.Root
        placeholder="Tìm kiếm theo ID hoặc tên người dùng..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 320 }}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon width={16} height={16} color="var(--gray-9)" />
        </TextField.Slot>
      </TextField.Root>

      <Flex gap="2" align="center">
        <Button
          variant={statusFilter === "all" ? "solid" : "soft"}
          size="2"
          onClick={() => onStatusFilterChange("all")}
        >
          Tất cả
        </Button>
        <Button
          variant={statusFilter === "active" ? "solid" : "soft"}
          color="green"
          size="2"
          onClick={() => onStatusFilterChange("active")}
        >
          Hoạt động
        </Button>
        <Button
          variant={statusFilter === "ended" ? "solid" : "soft"}
          color="gray"
          size="2"
          onClick={() => onStatusFilterChange("ended")}
        >
          Đã kết thúc
        </Button>
        <Button
          variant={statusFilter === "blocked" ? "solid" : "soft"}
          color="red"
          size="2"
          onClick={() => onStatusFilterChange("blocked")}
        >
          Đã chặn
        </Button>
      </Flex>
    </Flex>
  );
}