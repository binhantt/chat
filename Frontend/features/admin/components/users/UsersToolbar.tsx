import { Button, Flex, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { usersInnerBorder } from "@/features/admin/styles/usersTheme";

export type UserStatusFilter = "all" | "active" | "banned";

export function UsersToolbar({
  onSearchChange,
  onStatusChange,
  search,
  status,
}: {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: UserStatusFilter) => void;
  search: string;
  status: UserStatusFilter;
}) {
  return (
    <Flex
      align={{ initial: "stretch", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="3"
      style={{
        background: authTheme.panel,
        border: usersInnerBorder,
        borderRadius: 8,
        padding: 10,
      }}
    >
      <TextField.Root
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Tìm kiếm tên hoặc email..."
        size="3"
        style={{ flex: 1, minWidth: 0 }}
        value={search}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>

      <Flex gap="1" wrap="wrap">
        <FilterButton active={status === "all"} label="Tất cả" onClick={() => onStatusChange("all")} />
        <FilterButton active={status === "active"} color="green" label="Hoạt động" onClick={() => onStatusChange("active")} />
        <FilterButton active={status === "banned"} color="red" label="Đã khóa" onClick={() => onStatusChange("banned")} />
      </Flex>

      <Button size="3" style={{ borderRadius: 8, whiteSpace: "nowrap" }}>
        <PlusIcon />
        Thêm người dùng
      </Button>
    </Flex>
  );
}

function FilterButton({
  active,
  color,
  label,
  onClick,
}: {
  active: boolean;
  color?: "green" | "red";
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      color={color}
      onClick={onClick}
      size="2"
      variant={active ? "solid" : "soft"}
      style={{ borderRadius: 8 }}
    >
      {label}
    </Button>
  );
}
