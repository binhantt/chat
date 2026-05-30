import { Avatar, Box, Button, Dialog, Flex, Grid, Heading, Separator, Spinner, Text } from "@radix-ui/themes";
import type { AdminUser } from "@/features/athu";
import { authTheme } from "@/features/athu/styles/authTheme";
import { UserStatusBadge } from "./UserStatusBadge";
import { formatAdminCity, formatAdminDateTime, formatAdminValue, genderLabel, getUserInitials } from "./userUtils";

export function UserDetailDialog({
  onOpenChange,
  open,
  user,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: AdminUser | null;
}) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Content style={{ border: `1px solid ${authTheme.line}`, borderRadius: 8, maxWidth: 720 }}>
        <Dialog.Title>Chi tiết tài khoản</Dialog.Title>
        <Dialog.Description>Thông tin hồ sơ và trạng thái truy cập của người dùng.</Dialog.Description>

        {user ? (
          <Flex direction="column" gap="4" mt="4">
            <Flex align="center" gap="4">
              <Avatar
                fallback={getUserInitials(user.fullName, user.email)}
                radius="full"
                size="5"
                src={user.avatarUrl || undefined}
              />
              <Flex direction="column" gap="1">
                <Heading size="5">{user.fullName || "Chưa đặt tên"}</Heading>
                <Text size="2" style={{ color: authTheme.muted }}>
                  {user.email}
                </Text>
                <Flex align="center" gap="2" wrap="wrap">
                  <UserStatusBadge user={user} />
                </Flex>
              </Flex>
            </Flex>

            <Separator size="4" />

            <Grid columns={{ initial: "1", sm: "2" }} gap="3">
              <DetailItem label="ID" value={user.id} />
              <DetailItem label="Google ID" value={formatAdminValue(user.googleId)} />
              <DetailItem label="Số điện thoại" value={formatAdminValue(user.phoneNumber)} />
              <DetailItem label="Giới tính" value={genderLabel(user.gender)} />
              <DetailItem label="Ngày sinh" value={formatAdminDateTime(user.dateOfBirth)} />
              <DetailItem label="Thành phố" value={formatAdminCity(user.city)} />
              <DetailItem label="Ngày tạo" value={formatAdminDateTime(user.createdAt)} />
              <DetailItem label="Cập nhật cuối" value={formatAdminDateTime(user.updatedAt)} />
              <DetailItem label="Loại khóa" value={user.lockType && user.lockType !== "none" ? user.lockType : "Không khóa"} />
              <DetailItem label="Khóa đến" value={formatAdminDateTime(user.lockedUntil)} />
              <DetailItem label="Lý do khóa" value={formatAdminValue(user.lockReason)} />
              <DetailItem label="Báo cáo liên quan" value={formatAdminValue(user.lockedByReportId)} />
            </Grid>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium" style={{ color: authTheme.muted }}>
                Tiểu sử
              </Text>
              <Box style={{ background: "var(--auth-soft-control)", borderRadius: 8, minHeight: 72, padding: 12 }}>
                <Text size="2">{formatAdminValue(user.bio)}</Text>
              </Box>
            </Flex>

            <Flex justify="end">
              <Dialog.Close>
                <Button variant="soft" style={{ borderRadius: 8 }}>
                  Đóng
                </Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        ) : (
          <Flex align="center" justify="center" p="6">
            <Spinner size="3" />
          </Flex>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Flex direction="column" gap="1">
      <Text size="1" style={{ color: authTheme.muted }}>
        {label}
      </Text>
      <Text size="2" style={{ color: authTheme.text, overflowWrap: "anywhere" }}>
        {value}
      </Text>
    </Flex>
  );
}
