"use client";

import Link from "next/link";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import type { AdminUser } from "@/features/athu";
import { AdminUserRow } from "./AdminUserRow";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminRecentUsersPanel({ users }: { users: AdminUser[] }) {
  const s = useAdminStyles();

  return (
    <Box className={s.dashboard.recentUsersPanel}>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Text size="4" weight="bold" className={s.dashboard.recentUsersTitle}>
            Người dùng gần đây
          </Text>
          <Button asChild size="2" variant="soft" className={s.dashboard.recentUsersViewAll}>
            <Link href="/admin/users">Xem tất cả</Link>
          </Button>
        </Flex>

        {users.length === 0 ? (
          <Flex align="center" justify="center" p="5">
            <Text className={s.dashboard.recentUsersEmpty}>Chưa có người dùng nào</Text>
          </Flex>
        ) : (
          <Flex direction="column" className={s.dashboard.recentUsersList}>
            {users.slice(0, 3).map((user, i) => (
              <Box key={user.id} className={s.dashboard.recentUserItem} style={{ marginTop: i === 0 ? 8 : 0 }}>
                <AdminUserRow user={user} />
              </Box>
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
