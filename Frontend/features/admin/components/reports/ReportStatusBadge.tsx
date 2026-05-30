import { Badge } from "@radix-ui/themes";
import { reportStatusConfig } from "./reportUtils";

export function ReportStatusBadge({ status }: { status: string }) {
  const config = reportStatusConfig[status] || { color: "gray" as const, label: status };

  return (
    <Badge color={config.color} variant="soft">
      {config.label}
    </Badge>
  );
}
