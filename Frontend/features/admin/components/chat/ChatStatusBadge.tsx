import { Badge } from "@radix-ui/themes";
import type { AdminConversation } from "@/features/athu";

export function ChatStatusBadge({ status }: { status: AdminConversation["status"] }) {
  const config = {
    active: { color: "green" as const, label: "Hoạt động" },
    blocked: { color: "red" as const, label: "Đã chặn" },
    ended: { color: "gray" as const, label: "Đã kết thúc" },
  };
  const item = config[status] ?? config.ended;

  return (
    <Badge color={item.color} variant="soft">
      {item.label}
    </Badge>
  );
}
