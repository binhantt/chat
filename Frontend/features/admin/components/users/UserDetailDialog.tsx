import { Box, Button, Dialog, Flex, Grid, Heading, Separator, Spinner, Text } from "@radix-ui/themes";
import { AvatarWithVipBadge } from "@/components/shared/AvatarWithVipBadge";
import type { AdminUser } from "@/features/athu";
import { UserStatusBadge } from "./UserStatusBadge";
import { formatAdminCity, formatAdminDateTime, formatAdminValue, genderLabel, getUserInitials } from "./userUtils";
import { useAdminStyles } from "@/features/admin/hooks/useAdminStyles";

export function UserDetailDialog({
  onOpenChange,
  open,
  user,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: AdminUser | null;
}) {
  const s = useAdminStyles();
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Content className={s.users.detailDialogContent}>
        <Dialog.Title>Chi tiết tài khoản</Dialog.Title>
        <Dialog.Description>Thông tin hồ sơ và trạng thái truy cập của người dùng.</Dialog.Description>

        {user ? (
          <Flex direction="column" gap="4" mt="4">
            <Flex align="center" gap="4">
              <AvatarWithVipBadge
                fallback={getUserInitials(user.fullName, user.email)}
                radius="full"
                size="5"
                src={user.avatarUrl || undefined}
                badge={user.badge}
              />
              <Flex direction="column" gap="1">
                <Heading size="5">{user.fullName || "Chưa đặt tên"}</Heading>
                <Text size="2" className={s.users.detailField}>
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
              <Text size="2" weight="medium" className={s.users.detailField}>
                Tiểu sử
              </Text>
              <Box className={s.users.detailBio}>
                <Text size="2">{formatAdminValue(user.bio)}</Text>
              </Box>
            </Flex>

            <Flex justify="end">
              <Dialog.Close>
                <Button variant="soft" className={s.users.headerBtn}>
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
  const s = useAdminStyles();
  return (
    <Flex direction="column" gap="1">
      <Text size="1" className={s.users.detailField}>
        {label}
      </Text>
      <Text size="2" className={s.users.detailValue}>
        {value}
      </Text>
    </Flex>
  );
}
