import { Badge } from "@radix-ui/themes";
import type { Conversation } from "@/features/athu";

const config = {
  active: { label: "Đang hoạt động", color: "green" as const },
  ended: { label: "Đã kết thúc", color: "gray" as const },
  blocked: { label: "Đã chặn", color: "red" as const },
};

interface StatusBadgeProps {
  status: Conversation["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color } = config[status];
  return (
    <Badge color={color} variant="soft">
      {label}
    </Badge>
  );
}