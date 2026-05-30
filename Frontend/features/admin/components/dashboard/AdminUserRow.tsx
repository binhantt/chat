import { Avatar, Badge, Box, Flex, Text } from "@radix-ui/themes";
import type { AdminUser } from "@/features/athu";
import { authTheme } from "@/features/athu/styles/authTheme";

export function AdminUserRow({ user }: { user: AdminUser }) {
  return (
    <Flex
      align="center"
      gap="3"
      style={{
        background: authTheme.panelSoft,
        border: `1px solid ${authTheme.line}`,
        borderRadius: 8,
        padding: 12,
      }}
    >
      <Avatar fallback={getInitials(user.fullName, user.email)} radius="full" size="2" src={user.avatarUrl || undefined} />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text as="div" size="2" weight="bold" style={{ color: authTheme.text }}>
          {user.fullName || "Chưa đặt tên"}
        </Text>
        <Text as="div" size="1" style={{ color: authTheme.muted }}>
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
