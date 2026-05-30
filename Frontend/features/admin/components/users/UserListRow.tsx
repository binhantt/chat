import { Avatar, Box, Flex, Grid, Text } from "@radix-ui/themes";
import type { AdminUser } from "@/features/athu";
import { authTheme } from "@/features/athu/styles/authTheme";
import { usersInnerBorder } from "@/features/admin/styles/usersTheme";
import { formatAdminDate, getUserInitials } from "./userUtils";
import { UserActions } from "./UserActions";
import { UserStatusBadge } from "./UserStatusBadge";

export function UserListRow({
  onUpdate,
  onView,
  user,
}: {
  onUpdate: () => void;
  onView: (user: AdminUser) => void;
  user: AdminUser;
}) {
  return (
    <Box
      style={{
        background: "#FFFFFF",
        border: usersInnerBorder,
        borderRadius: 8,
      }}
    >
      <Grid
        display={{ initial: "none", lg: "grid" }}
        columns="minmax(240px, 1.35fr) minmax(220px, 1fr) 140px 160px 54px"
        style={{
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
        }}
      >
        <UserIdentity user={user} />
        <Text size="2" style={{ color: authTheme.text, overflowWrap: "anywhere" }}>
          {user.email}
        </Text>
        <UserStatusBadge user={user} />
        <Text size="2" style={{ color: authTheme.text }}>
          {formatAdminDate(user.createdAt)}
        </Text>
        <Flex justify="end">
          <UserActions onUpdate={onUpdate} onView={onView} user={user} />
        </Flex>
      </Grid>

      <Flex display={{ initial: "flex", lg: "none" }} direction="column" gap="3" style={{ padding: 16 }}>
        <Flex align="start" justify="between" gap="3">
          <UserIdentity user={user} />
          <UserActions onUpdate={onUpdate} onView={onView} user={user} />
        </Flex>

        <Flex direction="column" gap="2">
          <InfoBlock label="Email" value={user.email} />
          <InfoBlock label="Ngày tham gia" value={formatAdminDate(user.createdAt)} />
        </Flex>

        <Flex align="center" justify="between" gap="2">
          <Text size="1" style={{ color: authTheme.muted }}>
            Trạng thái
          </Text>
          <UserStatusBadge user={user} />
        </Flex>
      </Flex>
    </Box>
  );
}

function UserIdentity({ user }: { user: AdminUser }) {
  return (
    <Flex align="center" gap="3" style={{ minWidth: 0 }}>
      <Avatar fallback={getUserInitials(user.fullName, user.email)} radius="full" size="3" src={user.avatarUrl || undefined} />
      <Box style={{ minWidth: 0 }}>
        <Text as="div" size="3" weight="bold" style={{ color: authTheme.text, overflowWrap: "anywhere" }}>
          {user.fullName || "Chưa đặt tên"}
        </Text>
        <Text as="div" size="1" style={{ color: authTheme.muted }}>
          ID: {user.id.slice(0, 8)}
        </Text>
      </Box>
    </Flex>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text as="div" size="1" style={{ color: authTheme.muted }}>
        {label}
      </Text>
      <Text as="div" size="2" style={{ color: authTheme.text, overflowWrap: "anywhere" }}>
        {value}
      </Text>
    </Box>
  );
}
