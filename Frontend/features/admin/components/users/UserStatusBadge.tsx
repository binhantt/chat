import { Badge } from "@radix-ui/themes";
import type { AdminUser } from "@/features/athu";
import { isUserLocked } from "./userUtils";

export function UserStatusBadge({ user }: { user: AdminUser }) {
  const locked = isUserLocked(user);

  return (
    <Badge color={locked ? "red" : "green"} variant="soft">
      {locked ? "Đã khóa" : "Hoạt động"}
    </Badge>
  );
}
