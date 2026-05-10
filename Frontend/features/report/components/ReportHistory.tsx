"use client";

import { Flex, Text, Card, Box } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";

const history = [
  { title: "Lỗi hiển thị tin nhắn", status: "Đã xử lý", cat: "bug", time: "2 ngày trước" },
  { title: "Đề xuất thêm emoji", status: "Đang xem xét", cat: "suggest", time: "5 ngày trước" },
  { title: "Báo cáo tin nhắn spam", status: "Đã xử lý", cat: "abuse", time: "1 tuần trước" },
];

const catLabel: Record<string, string> = {
  bug: "🐛 Lỗi",
  suggest: "💡 Đề xuất",
  abuse: "🚩 Báo xấu",
};

export function ReportHistory() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card
      size="2"
      style={{
        background: isDark ? "var(--gray-11)" : "var(--white)",
        padding: "24px",
      }}
    >
      <Flex direction="column" gap="4">
        <Text size="4" weight="bold">Lịch sử báo cáo</Text>
        {history.map((item, i) => (
          <Flex
            key={i}
            align="center"
            justify="between"
            style={{
              paddingBottom: i < 2 ? "12px" : 0,
            }}
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: item.status === "Đã xử lý" ? "var(--green-9)" : "var(--yellow-9)",
                }}
              />
              <Flex direction="column" gap="0">
                <Text size="2" weight="medium">{item.title}</Text>
                <Text size="1" color="gray">{catLabel[item.cat]} · {item.time}</Text>
              </Flex>
            </Flex>
            <Text
              size="1"
              color={item.status === "Đã xử lý" ? "green" : "yellow"}
              style={{ background: isDark ? "var(--gray-10)" : "var(--gray-3)", padding: "2px 8px" }}
            >
              {item.status}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}
