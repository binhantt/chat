import { Box, Flex, Text } from "@radix-ui/themes";
import { authTheme } from "@/features/athu/styles/authTheme";
import { adminPanelStyle } from "@/features/admin/styles/dashboardTheme";
import { AdminProgressRow } from "./AdminProgressRow";
import type { AdminDashboardStats } from "./types";

export function AdminStatusPanel({ stats }: { stats: AdminDashboardStats }) {
  return (
    <Box style={adminPanelStyle}>
      <Flex direction="column" gap="3">
        <Text size="4" weight="bold" style={{ color: authTheme.text }}>
          Trạng thái người dùng
        </Text>
        <Flex direction="column" gap="3">
          <AdminProgressRow label="Hoạt động" total={stats.total} value={stats.active} />
          <AdminProgressRow label="Đã khóa" total={stats.total} value={stats.banned} tone="red" />
        </Flex>
      </Flex>
    </Box>
  );
}
