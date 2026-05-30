import { Grid } from "@radix-ui/themes";
import { ChatBubbleIcon, FileTextIcon, PersonIcon } from "@radix-ui/react-icons";
import { AdminStatCard } from "./AdminStatCard";
import type { AdminDashboardStats, AdminStatItem } from "./types";

export function AdminStatGrid({ stats }: { stats: AdminDashboardStats }) {
  const items: AdminStatItem[] = [
    { icon: <PersonIcon />, label: "Tổng người dùng", value: stats.total },
    { icon: <ChatBubbleIcon />, label: "Đang hoạt động", value: stats.active },
    { icon: <FileTextIcon />, label: "Đã khóa", value: stats.banned },
  ];

  return (
    <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="3">
      {items.map((item) => (
        <AdminStatCard icon={item.icon} key={item.label} label={item.label} value={item.value} />
      ))}
    </Grid>
  );
}
