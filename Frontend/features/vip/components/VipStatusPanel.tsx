import { Flex, Text } from "@radix-ui/themes";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { authTheme } from "@/features/athu/styles/authTheme";
import { UserPanel } from "@/features/user-layout/components";

export function VipStatusPanel() {
  return (
    <UserPanel maxWidth={340}>
      <Flex direction="column" gap="2">
        <Flex align="center" gap="2">
          <LockClosedIcon color={authTheme.gold} />
          <Text size="2" weight="bold" style={{ color: authTheme.text }}>
            Quyền lợi đang hoàn thiện
          </Text>
        </Flex>
        <Text size="2" style={{ color: authTheme.muted, lineHeight: 1.6 }}>
          Nút thanh toán sẽ được mở khi hệ thống mua gói hoàn tất.
        </Text>
      </Flex>
    </UserPanel>
  );
}
