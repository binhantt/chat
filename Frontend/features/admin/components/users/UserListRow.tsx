import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import type { AdminUser } from "@/features/athu";
import { formatAdminDate, getUserInitials } from "./userUtils";
import { UserActions } from "./UserActions";
import { UserStatusBadge } from "./UserStatusBadge";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function UserListRow({
  onUpdate,
  onView,
  user,
}: {
  onUpdate: () => void;
  onView: (user: AdminUser) => void;
  user: AdminUser;
}) {
  const s = useAdminStyles();
  return (
    <Box className={s.users.userRow}>
      <Grid
        display={{ initial: "none", lg: "grid" }}
        columns="minmax(240px, 1.35fr) minmax(220px, 1fr) 140px 160px 54px"
        className={s.users.userRowGrid}
      >
        <UserIdentity user={user} />
        <Text size="2" className={s.users.userEmail}>
          {user.email}
        </Text>
        <UserStatusBadge user={user} />
        <Text size="2" className={s.users.userDate}>
          {formatAdminDate(user.createdAt)}
        </Text>
        <Flex justify="end">
          <UserActions onUpdate={onUpdate} onView={onView} user={user} />
        </Flex>
      </Grid>

      <Flex display={{ initial: "flex", lg: "none" }} direction="column" gap="3" className={s.users.userRowMobile}>
        <Flex align="start" justify="between" gap="3">
          <UserIdentity user={user} />
          <UserActions onUpdate={onUpdate} onView={onView} user={user} />
        </Flex>

        <Flex direction="column" gap="2">
          <InfoBlock label="Email" value={user.email} />
          <InfoBlock label="Ngày tham gia" value={formatAdminDate(user.createdAt)} />
        </Flex>

        <Flex align="center" justify="between" gap="2">
          <Text size="1" className={s.users.listInfo}>
            Trạng thái
          </Text>
          <UserStatusBadge user={user} />
        </Flex>
      </Flex>
    </Box>
  );
}

function UserIdentity({ user }: { user: AdminUser }) {
  const s = useAdminStyles();
  return (
    <Flex align="center" gap="3" className={s.users.userIdentity}>
      <AvatarWithVipBadge fallback={getUserInitials(user.fullName, user.email)} radius="full" size="3" src={user.avatarUrl || undefined} badge={user.badge} />
      <Box className={s.users.userIdentity}>
        <Text as="div" size="3" weight="bold" className={s.users.userName}>
          {user.fullName || "Chưa đặt tên"}
        </Text>
        <Text as="div" size="1" className={s.users.userId}>
          ID: {user.id.slice(0, 8)}
        </Text>
      </Box>
    </Flex>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  const s = useAdminStyles();
  return (
    <Box>
      <Text as="div" size="1" className={s.users.detailField}>
        {label}
      </Text>
      <Text as="div" size="2" className={s.users.detailValue}>
        {value}
      </Text>
    </Box>
  );
}
