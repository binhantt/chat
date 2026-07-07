import { Button, Flex, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

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
  const s = useAdminStyles();
  return (
    <Flex
      align={{ initial: "stretch", md: "center" }}
      direction={{ initial: "column", md: "row" }}
      gap="3"
      className={s.users.toolbar}
    >
      <TextField.Root
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Tìm kiếm tên hoặc email..."
        size="3"
        className={s.users.toolbarSearch}
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

      <Button size="3" className={s.users.toolbarBtn}>
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
  const s = useAdminStyles();
  return (
    <Button
      color={color}
      onClick={onClick}
      size="2"
      variant={active ? "solid" : "soft"}
      className={s.users.filterBtn}
    >
      {label}
    </Button>
  );
}
