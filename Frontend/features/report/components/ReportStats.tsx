"use client";

import { Flex, Text, Card } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";

const stats = [
  { label: "Tin nhắn đã gửi", value: "1,248", icon: "💬", color: "indigo" },
  { label: "Người đã trò chuyện", value: "32", icon: "👥", color: "violet" },
  { label: "Thời gian trực tuyến", value: "48h", icon: "⏱️", color: "crimson" },
  { label: "Báo cáo đã tạo", value: "5", icon: "📊", color: "teal" },
];

export function ReportStats() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Flex gap="4" wrap="wrap">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          size="2"
          style={{
            flex: "1 1 180px",
            background: isDark ? "var(--gray-11)" : "var(--white)",
            padding: "20px",
          }}
        >
          <Flex direction="column" gap="2" align="center">
            <Text size="6">{stat.icon}</Text>
            <Text size="8" weight="bold" color={stat.color as any}>{stat.value}</Text>
            <Text size="2" color="gray">{stat.label}</Text>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}
