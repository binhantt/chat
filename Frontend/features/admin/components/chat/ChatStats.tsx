import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { StatCard } from "./StatCard";

interface ChatStatsProps {
  stats: {
    total: number;
    active: number;
    ended: number;
    blocked: number;
  };
}

export function ChatStats({ stats }: ChatStatsProps) {
  return (
    <Box style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 180px)",
      gap: 16,
      justifyContent: "center",
    }}>
      <StatCard title="Tổng cộng" value={stats.total} />
      <StatCard title="Đang hoạt động" value={stats.active} color="green" />
      <StatCard title="Đã kết thúc" value={stats.ended} color="gray" />
      <StatCard title="Đã chặn" value={stats.blocked} color="red" />
    </Box>
  );
}