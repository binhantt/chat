"use client";

import { Flex, Text, Box } from "@radix-ui/themes";
import { useTheme } from "@/contexts/ThemeContext";
import { ReportManagement } from "../../components/ReportManagement";

export default function AdminReportsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Box style={{ flex: 1, overflowY: "auto", background: isDark ? "var(--gray-12)" : "var(--gray-1)", padding: "24px" }}>
      <Flex direction="column" gap="6" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Flex direction="column" gap="1">
          <Text size="6" weight="bold" color="indigo">Quản lý báo cáo</Text>
          <Text size="2" color="gray">Xem và xử lý các báo cáo từ người dùng</Text>
        </Flex>

        <ReportManagement />
      </Flex>
    </Box>
  );
}
