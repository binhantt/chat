import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import {
  ChatBubbleIcon,
  CheckCircledIcon,
  LockClosedIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { chatInnerBorder } from "@/features/admin/styles/chatTheme";

export type ChatStatsValue = {
  active: number;
  blocked: number;
  ended: number;
  total: number;
};

export function ChatStatGrid({ stats }: { stats: ChatStatsValue }) {
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
  const color =
    tone === "green"
      ? "#22C55E"
      : tone === "red"
        ? "#EF4444"
        : tone === "gray"
          ? "#64748B"
          : authTheme.control;

  return (
    <Box
      style={{
        background: authTheme.panel,
        border: chatInnerBorder,
        borderRadius: 8,
        padding: 14,
      }}
    >
      <Flex align="center" gap="3" justify="between">
        <Box>
          <Text as="div" size="1" style={{ color: authTheme.muted }}>
            {label}
          </Text>
          <Text
            as="div"
            size="6"
            weight="bold"
            style={{ color: authTheme.text, lineHeight: 1.15 }}
          >
            {value}
          </Text>
        </Box>
        <Flex
          align="center"
          justify="center"
          style={{
            background: `${color}18`,
            borderRadius: 8,
            color,
            height: 42,
            width: 42,
          }}
        >
          {icon}
        </Flex>
      </Flex>
    </Box>
  );
}
