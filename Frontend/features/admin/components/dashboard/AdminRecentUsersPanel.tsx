import Link from "next/link";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import type { AdminUser } from "@/features/athu";
import { authTheme } from "@/features/athu/styles/authTheme";
import { adminPanelStyle } from "@/features/admin/styles/dashboardTheme";
import { AdminUserRow } from "./AdminUserRow";

export function AdminRecentUsersPanel({ users }: { users: AdminUser[] }) {
  return (
    <Box style={adminPanelStyle}>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Text size="4" weight="bold" style={{ color: authTheme.text }}>
            Người dùng gần đây
          </Text>
          <Button asChild size="2" variant="soft" style={{ borderRadius: 8 }}>
            <Link href="/admin/users">Xem tất cả</Link>
          </Button>
        </Flex>

        {users.length === 0 ? (
          <Flex align="center" justify="center" p="5">
            <Text style={{ color: authTheme.muted }}>Chưa có người dùng nào</Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="2">
            {users.map((user) => (
              <AdminUserRow key={user.id} user={user} />
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
