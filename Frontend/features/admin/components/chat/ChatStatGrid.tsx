import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  CheckCircledIcon,
  LockClosedIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export type ChatStatsValue = {
  active: number;
  blocked: number;
  ended: number;
  total: number;
};

export function ChatStatGrid({ stats }: { stats: ChatStatsValue }) {
  const s = useAdminStyles();
  return (
    <Grid columns={{ initial: "2", lg: "4" }} gap="3">
      <ChatStatCard icon={<ChatBubbleIcon />} label="Tổng cộng" value={stats.total} />
      <ChatStatCard icon={<CheckCircledIcon />} label="Hoạt động" tone="green" value={stats.active} />
      <ChatStatCard icon={<StopIcon />} label="Đã kết thúc" tone="gray" value={stats.ended} />
      <ChatStatCard icon={<LockClosedIcon />} label="Đã chặn" tone="red" value={stats.blocked} />
    </Grid>
  );
}

function ChatStatCard({
  icon,
  label,
  tone = "blue",
  value,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "blue" | "gray" | "green" | "red";
  value: number;
}) {
  const s = useAdminStyles();
  const color =
    tone === "green"
      ? "#22C55E"
      : tone === "red"
        ? "#EF4444"
        : tone === "gray"
          ? "#64748B"
          : "var(--primary)";

  return (
    <Box className={s.chat.statCard}>
      <Flex align="center" gap="3" justify="between">
        <Box>
          <Text as="div" size="1" className={s.chat.statLabel}>
            {label}
          </Text>
          <Text as="div" size="6" weight="bold" className={s.chat.statValue}>
            {value}
          </Text>
        </Box>
        <Flex align="center" justify="center" className={s.chat.statIconBox} style={{ background: `${color}18`, color }}>
          {icon}
        </Flex>
      </Flex>
    </Box>
  );
}
