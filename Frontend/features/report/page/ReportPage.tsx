"use client";

import { Flex, Text, Box } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";
import { ReportForm, ReportStats, ReportHistory } from "../components";

export function ReportPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Box style={{ flex: 1, overflowY: "auto", background: isDark ? "var(--gray-12)" : "var(--gray-1)", padding: "24px" }}>
      <Flex direction="column" gap="6" style={{ maxWidth: 800, margin: "0 auto" }}>

        <Flex direction="column" gap="1">
          <Text size="6" weight="bold" color="indigo">Báo cáo</Text>
          <Text size="2" color="gray">Gửi báo cáo vấn đề hoặc phản hồi</Text>
        </Flex>

        <ReportForm />
        <ReportStats />
        <ReportHistory />
      </Flex>
    </Box>
  );
}
