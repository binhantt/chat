"use client";

import { Badge, Box, Flex, Text } from "@radix-ui/themes";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import type { AdminUser } from "@/features/athu";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function AdminUserRow({ user }: { user: AdminUser }) {
  const s = useAdminStyles();

  return (
    <Flex align="center" gap="3" className={s.dashboard.userRow}>
      <AvatarWithVipBadge fallback={getInitials(user.fullName, user.email)} radius="full" size="2" src={user.avatarUrl || undefined} badge={user.badge} />
      <Box className={s.dashboard.userRowInfo}>
        <Text as="div" size="2" weight="bold" className={s.dashboard.userRowName}>
          {user.fullName || "Chưa đặt tên"}
        </Text>
        <Text as="div" size="1" className={s.dashboard.userRowEmail}>
          {user.email}
        </Text>
      </Box>
      <Badge color={user.isActive ? "green" : "red"} variant="soft">
        {user.isActive ? "Hoạt động" : "Đã khóa"}
      </Badge>
    </Flex>
  );
}

function getInitials(name: string | null, email: string) {
  if (!name) return email.slice(0, 2).toUpperCase();
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
